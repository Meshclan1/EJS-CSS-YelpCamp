// // Getting geo data based on seed location using Geocoding
// // Add the following code at the top so Seeds index can read the ENV file

if (process.env.NODE_ENV!=="production") {
    require('dotenv').config();
}

const mongoose=require('mongoose');
const cities=require('./cities');
const { places, descriptors }=require('./seedHelpers');
const Campground=require('../models/campground');


// // Import the mapbox
// const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");
// const mapBoxToken=process.env.MAPBOX_TOKEN;
// const geocoder=mbxGeocoding({ accessToken: mapBoxToken });

// mongoose.set('strictQuery', false)
// mongoose.connect('mongodb://localhost:27017/yelp-camp',
//     {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     })
//     .then(() => {
//         console.log("Mongo Connection Open!!")
//     })
//     .catch(err => {
//         console.log("Oh no Mongo connection error..")
//         console.log(err)
//     })


const dbUrl=process.env.DB_URL||'mongodb://localhost:27017/yelp-camp';

mongoose.set('strictQuery', false)
mongoose.connect(dbUrl).
    catch(error => handleError(error));


const db=mongoose.connection;
db.on('error', console.error.bind(console, 'Oh no Mongo connection error..'));
db.once('open', () => {
    console.log('Mongo Connection Open!!');
});


const sample=array => array[Math.floor(Math.random()*array.length)];



const seedDB=async () => {
    await Campground.deleteMany({}); // delete everything
    // Seed 50 new camps
    for (let i=0; i<250; i++) {
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            //YOUR USER ID
            author: '63d01fb54282a49296a99b0b',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {

                    url: 'https://res.cloudinary.com/dnk9sziva/image/upload/v1675269606/YelpCamp/CC31FA99-12EB-4A79-80BC-FDC83DF11F67_1_105_c_nsevw8.jpg',
                    filename: 'YelpCamp/CC31FA99-12EB-4A79-80BC-FDC83DF11F67_1_105_c_nsevw8'

                    // url: 'https://res.cloudinary.com/dnk9sziva/image/upload/v1674760409/YelpCamp/gns1jnw4qefqjkysjjhy.jpg',
                    // filename: 'YelpCamp/gns1jnw4qefqjkysjjhy'

                    // url: 'https://res.cloudinary.com/dnk9sziva/image/upload/v1674825336/YelpCamp/wuxfqqz2hgqhcqes6fjt.jpg',
                    // filename: 'YelpCamp/wuxfqqz2hgqhcqes6fjt'

                    // url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
                    // filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
                },
                {

                    url: 'https://res.cloudinary.com/dnk9sziva/image/upload/v1675269606/YelpCamp/48654EA6-7143-49B9-A458-67C4FDB91253_1_105_c_cnnzyl.jpg',
                    filename: 'YelpCamp/48654EA6-7143-49B9-A458-67C4FDB91253_1_105_c_cnnzyl'

                    // url: 'https://res.cloudinary.com/dnk9sziva/image/upload/v1674759667/YelpCamp/qk2zlppjgyxhz2pzmebm.jpg',
                    // filename: 'YelpCamp/qk2zlppjgyxhz2pzmebm'
                    // url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
                    // filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
                },
                {
                    url: 'https://images.unsplash.com/photo-1670239509764-98c3d2c2d2ee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
                    filename: 'polina-kuzovkova-8RKZXcDw44U-unsplash.jpg'
                }
            ]
        })
        await camp.save();
    }
}


seedDB().then(() => {
    mongoose.connection.close();
});






// const seedDB=async () => {
//     await Campground.deleteMany({});
//     for (let i=0; i<300; i++) {
//         const random1000=Math.floor(Math.random()*1000);
//         const price=Math.floor(Math.random()*20)+10;

//         const location=`${cities[random1000].city}, ${cities[random1000].state}`
//         const geoData=await geocoder.forwardGeocode({
//             query: location,
//             limit: 1
//         }).send()

//         const camp=new Campground({
//             //Your User ID
//             author: '63d01fb54282a49296a99b0b',
//             title: `${sample(descriptors)}, ${sample(places)}`,
//             location: location,
//             geometry: geoData.body.features[0].geometry,
//             images: [
//                 {
//                     url: 'https://res.cloudinary.com/dnk9sziva/image/upload/v1674771086/YelpCamp/tqbhievrozpn7wrim6qi.jpg',
//                     filename: 'YelpCamp/tqbhievrozpn7wrim6qi'
//                 },
//                 {
//                     url: 'https://res.cloudinary.com/dnk9sziva/image/upload/v1674771090/YelpCamp/czs4grjdmsjpfgkadn3k.jpg',
//                     filename: 'YelpCamp/czs4grjdmsjpfgkadn3k'
//                 }
//             ],
//             description: "This is a test description",
//             price: price
//         })
//         await camp.save()
//     }
// }

