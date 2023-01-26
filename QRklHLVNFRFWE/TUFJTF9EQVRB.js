var MAIL_ENC = require('../helper/encrypter');

module.exports = {
  Mail: {
    Host: MAIL_ENC._decrypt('U2FsdGVkX19NyYxNdiIARGqLgFZxbQICIfplBv8YBgeit6guqhdPWePFvET%2BaGZZ').slice(1, -1),
    Port: 465,
    User: MAIL_ENC._decrypt('U2FsdGVkX19F5DBOgGvXFVyRCxLFODP721WZjiAh3tJsDC8c5Oa%2B3apYirVeaAR%2B').slice(1, -1),
    Pass: MAIL_ENC._decrypt('U2FsdGVkX1%2B8tZCB1nz9lrEUYP7fdychtjFj2TovZXyPn0IQwSVILqU5SdvUUTGiL0MRKeCtLp4l%2BHw0034WNBix0rUraH3%2FlSnD20EPj2o%3D').slice(1, -1),
    From: 'support@mradhulexchange.com'
  }
}

