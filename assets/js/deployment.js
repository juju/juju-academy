var Deployment = function(name) {
  var data = {};
  if($.isPlainObject(name)) {
    data = name;
    name = data.environment;
  }

  this.environment = name;
  this.machines = data.machines || {};
  this.services = data.services || {};
  this.charms = data.charms || {};
  this.juju_version = data.juju_version || '1.18.1';

  return this;
};

Deployment.prototype.bootstrap = function(constraints) {
  this.add_machine(constraints);
};

Deployment.prototype.status = function() {
  return {
    'environment': this.environment,
    'machines': this.machines,
    'services': this.services
  };
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
  } else {
    // TODO: Pass constraints from the command line, build machine, pass to add_unit
    //if(constraints) {
    //  machine = this.add_machine(constraints);
    //}
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

  this.add_unit(service, units, to);
};

Deployment.prototype.relate = function(from, to) {
  //
};

Deployment.prototype.add_unit = function(service, num_units, to) {
  var machine = null;

  if(isNaN(num_units)) {
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
      unit_num = previous_unit.split('/')[1] + 1;
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

Deployment.prototype.toString = function() {
  return JSON.stringify(this.status());
};
