import os
import cognitive_face as cf
import tabulate
import inflection


def handler(context, event):

    image_url = event.body.decode('utf-8').strip()
    context.logger.info(image_url)
    key = os.environ.get('API_KEY')
    base_url = os.environ.get('BASE_URL')

    if key is None:
        context.logger.warn('Face API key not set, cannot continue')
        return _build_response(context, 'Function misconfigured: Face API key not set', 503)

    if base_url is None:
        context.logger.warn('Face API base URL not set, cannot continue')
        return _build_response(context, 'Function misconfigured: Face API base URL not set', 503)

    if not image_url:
        context.logger.warn('No URL given in request body')
        return _build_response(context, 'Image URL required', 400)

    cf.Key.set(key)
    cf.BaseUrl.set(base_url)

    try:
        context.logger.info('Requesting detection from Face API: {0}'.format(image_url))
        detected_faces = cf.face.detect(image_url,
                                        face_id=False,
                                        attributes='age,gender,glasses,smile,emotion')
    except Exception as error:
        context.logger.warn('Face API error occurred: {0}'.format(error))
        return _build_response(context, 'Face API error occurred', 503)

    parsed_faces = []

    for face in detected_faces:
        coordinates = face['faceRectangle']
        attributes = face['faceAttributes']

        center_x = coordinates['left'] + coordinates['width'] / 2
        center_y = coordinates['top'] + coordinates['height'] / 2

        primary_emotion = sorted(attributes['emotion'].items(), key=lambda item: item[1])[-1][0]

        parsed_face = {
            'x': center_x,
            'y': center_y,
            'position': '({0},{1})'.format(int(center_x), int(center_y)),
            'gender': inflection.humanize(attributes['gender']),
            'age': int(attributes['age']),
            'glasses': inflection.humanize(inflection.underscore(attributes['glasses'])),
            'primary_emotion': inflection.humanize(primary_emotion),
            'smile': '{0:.1f}%'.format(attributes['smile'] * 100),
        }

        parsed_faces.append(parsed_face)

    parsed_faces.sort(key=lambda face: (face['x'], face['y']))

    first_row = ('',) + tuple(face['position'] for face in parsed_faces)
    make_row = lambda name: (inflection.humanize(name),) + tuple(
                            face[name] for face in parsed_faces)

    other_rows = [make_row(name) for name in [
                  'gender', 'age', 'primary_emotion', 'glasses', 'smile']]

    return _build_response(context,
                           tabulate.tabulate([first_row] + other_rows,
                                             headers='firstrow',
                                             tablefmt='fancy_grid',
                                             numalign='center',
                                             stralign='center'),
                           200)


def _build_response(context, body, status_code):
    return context.Response(body=body,
                            headers={},
                            content_type='text/plain',
                            status_code=status_code)