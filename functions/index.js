const admin = require('firebase-admin');
admin.initializeApp();
const functions = require("firebase-functions");
const firestore = admin.firestore();
const axios = require('axios')


async function updateWeatherData() {
    const resp = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=47.886398&lon=106.905746&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`);
    const data = resp.data;
    await firestore.collection('weather').doc('ulaanbaatar').set(data, {merge: true})
    console.log('saved')
    return {
        message: 'success'
    }
}

exports.scheduleUpdateMidnight = functions.pubsub.schedule('0 0 * * *').onRun(updateWeatherData)
exports.scheduleUpdateMorning = functions.pubsub.schedule('0 8 * * *').onRun(updateWeatherData)
exports.scheduleUpdateAfternoon = functions.pubsub.schedule('0 14 * * *').onRun(updateWeatherData)
exports.scheduleUpdateEvening = functions.pubsub.schedule('10 20 * * *').onRun(updateWeatherData)

exports.weather = functions.https.onRequest(async (req, res) => {
    const city = req.query.city || 'ulaanbaatar';
    const result = await firestore.collection('weather').doc(city).get();

    res.set('Cache-Control', 'public, max-age=1800, s-max-age=900');
    if (result.exists) {
        return res.send(result.data())
    }
    return res.status(400).send({
        'error': `No city ${city} found.`
    })
})