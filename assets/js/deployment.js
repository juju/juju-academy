var Deployment = function(name) {
  var data = {};
  if($.isPlainObject(name)) {
    data = name;
    name = data.environment;
  }

  this.environment = name;
  this.machines = data.machines || {};
  this.services = data.services || {};
  this.config = data.config || {};
  this.charms = data.charms || {};
  this.juju_version = data.juju_version || '1.18.1';

  return this;
};

Deployment.prototype.bootstrap = function(constraints) {
  this.add_machine(constraints);
};

Deployment.prototype.status = function(filters) {
  if(!filters) {
    return {
      'environment': this.environment,
      'machines': this.machines,
      'services': this.services
    };
  } else {
    var machine_ids = [0],
        machines = {},
        services = {};
    for(var i in filters) {
      var service = filters[i];
      if(!(service in this.services)) {
        continue;
      }

      services[service] = this.services[service];
      for(var unit in this.services[service].units) {
        var unit_data = this.services[service].units[unit];
        if($.inArray(unit_data.machine, machines) < 0) {
          machine_ids.push(parseInt(unit_data.machine));
        }
      }
    }

    for(var m in machine_ids) {
      machines[machine_ids[m]] = this.machines[machine_ids[m]];
    }

    return {
      'environment': this.environment,
      'machines': machines,
      'services': services
    };
  }
};

Deployment.prototype.deploy = function(service, charm, to, units) {
  var machine = null,
      unit_name = '{0}/0'.format(service);

  if(!units) {
    units = 1;
  }

  if(to) {
    // TODO: (lxc|kvm): parsing
    if(!(to.toString() in this.machines)) {
      throw "error: machine {0} doesn't exist".format(to);
    }
    machine = to;
  //} else {
  //  // TODO: Pass constraints from the command line, build machine, pass to add_unit
  //  if(constraints) {
  //    machine = this.add_machine(constraints);
  //  }
  }

  if(!charm.id) {
    throw "Charm not valid";
  }

  if(service in this.services) {
    throw "{0} has already been deployed".format(service);
  }

  // Build juju status output
  if(!(charm.id in this.charms)) {
    this.charms[charm.url] = charm;
  }

  this.services[service] = {
    'charm': charm.url,
    'exposed': false,
    'units': {}
  };

  this.config[service] = {};
  var self = this;
  $.each(charm.options, function(index, option) {
    self.config[service][index] = {};
    self.config[service][index].default = true;
    self.config[service][index].type = option.type;
    self.config[service][index].description = option.description;
    self.config[service][index].value = option.default;
  });

  this.add_unit(service, units, to);
};

Deployment.prototype.relate = function(from, to) {
  var m = '[a-z0-9]+:[a-z0-9]+',
      from_service = null,
      from_relation = null,
      to_service = null,
      to_relation = null;

  if(from.match(m)) {
    from_service = from.match(m)[0];
    from_relation = from.match(m)[1];
  } else {
    from_service = from;
  }

  if(to.match(m)) {
    to_service = to.match(m)[0];
    to_relation = to.match(m)[1];
  } else {
    to_service = to;
  }

  if(!(from_service in this.services)) {
    throw '{0} not found in deployment'.format(from_service);
  }

  if(!(to_service in this.services)) {
    throw '{0} not found in deployment'.format(to_service);
  }

  if(!this.services[from_service].relations) {
    this.services[from_service].relations = [to_service];
  } else {
    if($.inArray(to_service, this.services[from_service].relations) >= 0) {
      throw 'ERROR cannot add relation "{0} {1}": relation already exists'.format(from_service, to_service);
    } else {
      this.services[from_service].relations.push(to_service);
    }
  }

  if(!this.services[to_service].relations) {
    this.services[to_service].relations = [from_service];
  } else {
    if($.inArray(from_service, this.services[to_service].relations) >= 0) {
      throw 'ERROR cannot add relation "{0} {1}": relation already exists'.format(from_service, to_service);
    } else {
      this.services[to_service].relations.push(from_service);
    }
  }
};

Deployment.prototype.add_unit = function(service, num_units, to) {
  var machine = null;

  if(isNaN(parseInt(num_units))) {
    throw 'num_units is not a valid number';
  }

  if(to) {
    // TODO: (lxc|kvm): parsing
    if(!(to.toString() in this.machines)) {
      throw "error: machine {0} doesn't exist".format(to);
    }
    machine = to;
  } else {
    machine = this.add_machine();
  }

  for(var i = 0; i < num_units; i++) {
    var previous_unit = Object.keys(this.services[service].units).sort().pop(),
        unit_num = 0;

    if(previous_unit) {
      unit_num = parseInt(previous_unit.split('/')[1]) + 1;
    }

    var unit_name = '{0}/{1}'.format(service, unit_num);

    this.services[service].units[unit_name] = {
      'agent-state': 'started',
      'agent-version': this.juju_version,
      'machine': machine,
      'public-address': this.machines[machine]['dns-name']
    };
  }
};

Deployment.prototype.add_machine = function(constraints) {
  var last_machine_num = parseInt(Object.keys(this.machines).sort().pop()),
      machine_index = (last_machine_num + 1).toString(),
      instance = (new Date()).getTime(),
      profile = [],
      hardware = {'arch': 'demo', 'cpu-cores': 1, 'cpu-power': '∞',
                  'mem': '1024M', 'root-disk': '1892M'};

  if(isNaN(last_machine_num)) {
    // Bootstrap node request
    machine_index = "0";
  }

  if(!constraints) {
    constraints = {};
  }

  for(var c in constraints) {
    if(!(c in hardware)) {
      throw "Unknown constraint: {0}".format(c);
    }
    hardware[c] = constraints[c];
  }

  for(var h in hardware) {
    profile.push("{0}={1}".format(h, hardware[h]));
  }

  this.machines[machine_index] = {
    'agent-state': 'started',
    'agent-version': this.juju_version,
    'dns-name': '{0}.localhoast.com'.format(instance),
    'hardware': profile.join(' '),
    'instance-id': instance,
    'instance-state': 'running',
    'series': 'trusty'
  };

  return machine_index;
};

Deployment.prototype.is_deployed = function(service) {
  return $.inArray(service, this.services);
};

Deployment.prototype.set = function(service, key, value) {
  try {
    this.config[service][key].value = value;
    this.config[service][key].default = false;
  }
  catch(e) {
    throw "ERROR: {0}".format(e);
  }
};

Deployment.prototype.destroy_service = function(service) {
  if(!(service in this.services)) {
    throw 'ERROR service "{0}" not found'.format(service);
  }
  // <3 check if units in error
  delete this.services[service];
};

Deployment.prototype.toString = function() {
  return JSON.stringify(this.status());
};
