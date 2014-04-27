
// TODO: Make this a "Class" with a toString prototype, etc
// TODO: Move to it's own project and import with bower

var get_charm = function(charm_id, cb) {
  var charm_url = charm_id.trim().replace('cs:', ''),
      parts = charm_url.split('/');

  if(charm_url.startsWith('~')) {
    if(parts.length < 3) {
      charm_url = parts[0] + '/precise/' + parts[1];
    }
  } else {
    if(parts.length < 2) {
      charm_url = 'precise/' + parts[0];
    }
  }

  $.getJSON('https://manage.jujucharms.com/api/3/charm/{0}'.format(charm_url), function(data) {
    cb(false, data.charm);
  });
};
