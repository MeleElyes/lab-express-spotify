require("dotenv").config();
const SpotifyWebApi = require("spotify-web-api-node");
const express = require("express");
const hbs = require("hbs");

// require spotify-web-api-node package here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:

// Our routes go here:
app.get("/", (req, res) => {
  res.render("homepage",{layout : false});
});

app.get("/artist-search", (req, res) => {
  spotifyApi
    .searchArtists(req.query.artist)
    .then((data) => {
      console.log("The received data from the API: ", data.body.artists.items);
      // ----> 'HERE'S WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
      const filterPhoto = data.body.artists.items.filter(
        (e) => e.images.length !== 0
      );
      res.render("artist-search-results", {
        artists: filterPhoto,
        layout: false,
      });
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

app.get("/albums/:artistId", (req, res, next) => {
  spotifyApi.getArtistAlbums(req.params.artistId).then((data) => {
    res.render("albums", {
      artists: data.body.items,
      layout: false,
    });
  });
});

app.get("/tracks/:artistId", (req, res, next) => {
  spotifyApi
    .getAlbumTracks(req.params.artistId, { limit: 10, offset: 1 })
    .then((data) => {
      res.render("tracks", {
        artists: data.body.items,
        layout: false,
      });
    });
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
