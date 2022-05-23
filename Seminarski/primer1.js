var moment = require('moment');

exports.handler = function(context, event) {
    var request = JSON.parse(event.body);
    var now = moment();

    context.logger.infoWith('Adding to now', {
        'request': request,
        'to': now.format()
    });

    now.add(request.value, request.unit);

    context.callback(now.format());
};

