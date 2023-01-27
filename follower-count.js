// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: desktop;
// Social Media Followers Count Widget for Scriptable by Jannis Hutt
// GitHub Repository: https://github.com/hutt/scriptable-follower-count-widget

// ### INFO: WIDGET PARAMETERS ###
// parameters are seperated by a semicolon (";" or "; ").
// example widget parameter strings: "display:twitter", "display:twitter,instagram; instagram:aluhutt.jpg"
//
//
// OPTIONS:
// - choose social network(s) to display (optional; default: all)
//   prefix: "display"
//   possible values: "twitter", "mastodon", instagram", "facebook", "youtube", "all", or a combination, e.g. "twitter,instagram".
//   examples: "display:twitter", "display:twitter,instagram", "display:all"
//
// - overwrite username(s) (optional; overwrites default usernames in the config section below)
//   prefixes: network names ("twitter", "mastodon", "instagram", "facebook", "youtube")
//   value: your username (without a leading "@")
//   examples: "display:twitter; twitter:aluhutt", "mastodon:jannis@hutt.social", "display:all; mastodon:jannis@hutt.social; twitter:aluhutt"

// ####### SETUP #######
// Store Cache File locally or in iCloud Drive?
const STORE_CACHE = "icloud"; // options: icloud, local

// Default usernames
// (can be overwritten by widget parameters (see above))
var twitter = "test";
var mastodon = "test@test.example.social";
var instagram = "test";
var facebook = "test";
var youtube = "test";

// Append "Followers" or "Subscribers" behind the number?
const HIDE_FOLLOWERS_LABEL = true;

// In which interval do you want to query your follower count?
const CACHE_TTL = 3600; // in seconds. 3600s = 1h

// Styling
const BACKGROUND_COLOR = Color.dynamic(
  new Color("#ffffff"), // Background color for the light theme
  new Color("#161618")  // Background color for the dark theme
);

const TEXT_COLOR = Color.dynamic(
  new Color("#333333"), // Text color for the light theme
  new Color("#ffffff")  // Text color for the dark theme
);
// ####### END SETUP #######
// don't touch anything under here, unless you know what you're doing

// Social Icons constants
const SOCIAL_ICONS_FOLDER_URL = "https://raw.githubusercontent.com/hutt/scriptable-follower-count-widget/main/icons/";
const SOCIAL_ICONS_FILENAMES = ["facebook", "facebook_white", "instagram", "instagram_white", "mastodon", "mastodon_white", "twitter", "twitter_white", "youtube"];
const REQUEST_TIMEOUT = 3; // how many seconds until timeout when downloading social icons?

// HELPER FUNCTIONS
// Get display parameter
function getDisplayParameters(parameters){
  let params = parameters;
  if (!parameters){
    params = "display:all";
  }
  let available_platforms = ["twitter", "mastodon", "instagram", "facebook", "youtube", "all"];
  let regex = /display:([\w,]+)[;\s]*/gi;
  let parameter_string = regex.exec(params);
  let parameter_value = parameter_string[1];
  let platforms = parameter_value.split(",");
  for (let platform of platforms){
    if (!available_platforms.includes(platform)){
      platforms = "error";
    }
  }
  return platforms;
}

// Get username parameters
function getUsernameParameters(platform, parameters) {
  let regex = new RegExp(`${platform}:([\\w\\d_.@]+)[;\\s]*`, "gi");
  let parameter_string = regex.exec(parameters)[1];
  return parameter_string;
}

// Download icons
async function downloadSocialIcons() {
  console.log("loading and saving social icons");
  for (img of SOCIAL_ICONS_FILENAMES) {
    let img_path = fm.joinPath(icons_dir, img + ".png");
    if (!fm.fileExists(img_path)) {
      console.log("loading image: " + img + ".png");
      let request = new Request(SOCIAL_ICONS_FOLDER_URL + img + ".png");
      request.timeoutInterval(REQUEST_TIMEOUT);
      console.log(request);
      image = await request.loadImage();
      fm.writeImage(img_path, image);
    }
  }
}

async function getImageFor(platform, version = "standard") {
  let filename = platform;
  if (version != "standard") {
    filename = filename + "_" + version;
  }
  let img_path = fm.joinPath(icons_dir, filename + ".png");
  await fm.downloadFileFromiCloud(img_path);
  img = await fm.readImage(img_path);
  return img;
}

async function writeDataToCache(data) {
  data.savedDate = Date.now();
  fm.writeString(path, JSON.stringify(data));
  console.log("saved new data to file");
}

async function getDataFromCache() {
  await fm.downloadFileFromiCloud(path);
  data = await JSON.parse(fm.readString(path));
  console.log("fetching data from file was successful");
  return data;
}

function configFileFirstInit() {
  // define timestamp that forces script to reload data in the next step
  let outdated_timestamp = Date.now() - ((CACHE_TTL-1) * 1000);

  // define object variable to be written later on
  let data = new Object();
  data.cached = [];

  // write twitter username to cache (if set)
  if (twitter) {
    data.cached.push ({
      timestamp: outdated_timestamp,
      platform: "twitter",
      username: twitter,
      followers: null
    });
  }

  // write mastodon username to cache  (if set)
  if (mastodon) {
    data.cached.push({
      timestamp: outdated_timestamp,
      platform: "mastodon",
      username: mastodon,
      followers: null
    });
  }

  // write instagram username to cache  (if set)
  if (instagram) {
    data.cached.push({
      timestamp: outdated_timestamp,
      platform: "instagram",
      username: instagram,
      followers: null
    });
  }

  // write facebook username to cache  (if set)
  if (facebook) {
    data.cached.push({
      timestamp: outdated_timestamp,
      platform: "facebook",
      username: facebook,
      followers: null
    });
  }

  // write youtube username to cache  (if set)
  if (youtube) {
    data.cached.push({
      timestamp: outdated_timestamp,
      platform: "youtube",
      username: youtube,
      followers: null
    });
  }
  writeDataToCache(data);
}

// get username
function getUsername(platform) {
  let username = "";
  switch (platform){
    case "twitter":
      username = twitter;
      break;
    case "mastodon":
      username = mastodon;
      break;
    case "instagram":
      username = instagram;
      break;
    case "facebook":
      username = facebook;
      break;
    case "youtube":
      username = youtube;
    break;
  }
  return username;
}

// overwrite username parameter
function setUsername(platform, name) {
  switch (platform) {
    case "twitter":
      twitter = name;
      break;
    case "mastodon":
      mastodon = name;
      break;
    case "instagram":
      instagram = name;
      break;
    case "facebook":
      facebook = name;
      break;
    case "youtube":
      youtube = name;
    break;
  }
}

function createLinearGradient(colors) {
    let gradient = new LinearGradient();

    let num_locations = colors.length;
    let locations_array = [];
    let colors_array = [];
    for (let i = 0; i < num_locations - 1; i++) {
      let color_location = i * (1 / (num_locations - 1));
      color_location = color_location.toFixed(3);
      locations_array.push(parseFloat(color_location));

      let color = new Color(colors[i]);
      colors_array.push(color);
    }

    gradient.locations = locations_array;
    gradient.colors = colors_array;
    return gradient;
}

// Load Twitter Followers
async function loadTwitterFollowers(user) {
  // requesting data
  // let request_url = "https://mobile.twitter.com/" + user;
  let url = "https://nitter.it/" + user;
  
  let request = new Request(url);
  request.headers = {
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1",
  };
  
  let wv = new WebView();
  await wv.loadRequest(request);
  let html = await wv.getHTML();
  let regex = /\<span\sclass\=\"profile\-stat\-num\"\>([\d\.\,]+)\<\/span\>/gi;

  // get fourth regex match (Followers)
  let followers = 0;
  for (let i = 0; i < 3; i++) {
    followers = regex.exec(html)[1];
  }
  followers = followers.replace(/\,/g, "");
  followers = parseInt(followers);

  return followers;
}

async function loadMastodonFollowers(user) {
  return 1234;
}

async function loadInstagramFollowers(user) {
  return 1234;
}

async function loadFacebookFans(user) {
  return 1234;
}

async function loadYouTubeSubscribers(user) {
  return 1234;
}

async function getData(platform, hide_followers) {
  let data = 0;
  var username = null;

  // Followers name and username?
  let followers_name = "Followers";
  switch (platform) {
    case "twitter":
      username = twitter;
      followers_name = "Followers";
      break;
    case "mastodon":
      username = mastodon;
      followers_name = "Followers";
      break;
    case "instagram":
      username = instagram;
      followers_name = "Followers";
      break;
    case "facebook":
      username = facebook;
      followers_name = "Page Likes";
      break;
    case "youtube":
      username = youtube;
      followers_name = "Subscribers";
      break;
  }
  
  let from_cache = await getDataFromCache();

  // try to get object for platform
  let found_object_index = await from_cache.cached.findIndex(item => item.platform === platform && item.username === username);

  // Check if data is cached
  if (found_object_index != -1){
    // data is cached.
    console.log("getData(): requested data is cached.");

    // now get timestamp 
    let found_object = from_cache.cached[found_object_index];
    let timestamp = found_object.timestamp;

    // if time stamp is too old, load data:
    if (Math.floor((Date.now() - timestamp) / 1000) >= CACHE_TTL) {
      // data is cached but too old. loading new data.
      console.log("getData(): cached data too old. loading new data.");
      // call right function to load followers
      switch (platform) {
        case "twitter":
          data = await loadTwitterFollowers(twitter);
          break;
        case "mastodon":
          data = await loadMastodonFollowers(mastodon);
          break;
        case "instagram":
          data = await loadInstagramFollowers(instagram);
          break;
        case "facebook":
          data = await loadFacebookFans(facebook);
          break;
        case "youtube":
          data = await loadYouTubeSubscribers(youtube);
          break;
      }
      // now replace data in cache file
      found_object.timestamp = Date.now();
      found_object.followers = await data;
      from_cache.cached[found_object_index] = found_object;
      writeDataToCache(from_cache);
      console.log("wrote new " + platform + " followers count to cache: " + data);
    } else {
      // time stamp was not too old. load from cache.
      console.log("cached data still valid.")
      data = found_object.followers;
    }
  } else {
    // requested data not found in cache. loading...
    console.log("getData(): requested data is not cached.");

    let new_follower_count = 0;
    // call right function to load followers
    switch (platform) {
      case "twitter":
        new_follower_count = await loadTwitterFollowers(twitter);
        break;
      case "mastodon":
        new_follower_count = await loadMastodonFollowers(mastodon);
        break;
      case "instagram":
        new_follower_count = await loadInstagramFollowers(instagram);
        break;
      case "facebook":
        new_follower_count = await loadFacebookFans(facebook);
        break;
      case "youtube":
        new_follower_count = await loadYouTubeSubscribers(youtube);
        break;
    }

    let new_data_object = new Object();
    new_data_object.timestamp = Date.now();
    new_data_object.platform = platform;
    new_data_object.username = username;
    new_data_object.followers = await new_follower_count;

    from_cache.cached.push(new_data_object);
    writeDataToCache(from_cache);
  }

  // Format Data
  let data_string = data.toLocaleString(); 
  if (!hide_followers) {
    data_string = data_string + " " + followers_name;
  }
  return data_string;
}

// PARAMETERS
// Get parameters; if none, set "display:all"
let parameters = await args.widgetParameter;
let display_mode = getDisplayParameters(parameters);

// check if the platform named after "display:" ist valid
if (display_mode == "error") {
  console.error("specified platform not found.");
} else {
  console.log("showing follower count for the following platform(s): " + display_mode.join(", "));
}

// social media username parameters
let platforms = ["twitter", "mastodon", "instagram", "facebook", "youtube"];
for (let i = platforms.length - 1; i >= 0; i--) {
  // if social network name is found in parameter string, overwrite username variable with matched username string
  if (display_mode.includes(platforms[i] + ":")) {
    let new_username = getUsernameParameters(platforms[i], parameters);
    setUsername(platforms[i], new_username);
    console.log(platforms[i] + " username overwritten: " + new_username);
  }
}

// Get Widget Size
let widget_size = config.widgetFamily;

// CACHE
// Store cache locally or in iCloud?
let fm = FileManager.iCloud();

if (STORE_CACHE == "local") {
  fm = FileManager.local();
} else if (STORE_CACHE == "icloud") {
  fm = FileManager.iCloud();
} else {
  console.error('Please specify where to store the cache file ("local" or "icloud").');
}

// Set dirs and path; create new cache directory if not existent
let dir = fm.joinPath(fm.documentsDirectory(), "follower-count");
let icons_dir = fm.joinPath(dir, "icons");
let path = fm.joinPath(dir, "follower-count-cache.json");
if (!fm.fileExists(dir)) {
  fm.createDirectory(dir);
}

// ICONS
// check if there is an icons directory; if not, create it
if (!fm.fileExists(icons_dir)) {
  fm.createDirectory(icons_dir);
  console.log("created new icons subdirectory.");
}

// check if icons directory contains any files; if not, download them
if (fm.listContents(icons_dir).length == 0) {
  downloadSocialIcons();
}

// FONTS
// small widget
let thin_font = Font.regularRoundedSystemFont(13);
let small_font = Font.regularRoundedSystemFont(11);
let bold_font = Font.heavyRoundedSystemFont(18);
let title_font = Font.heavyRoundedSystemFont(16);

// WIDGETS
async function createDefaultWidget(text) {
  let default_widget = new ListWidget();
  default_widget.backgroundColor = BACKGROUND_COLOR;

  let header = default_widget.addText(text);
  header.centerAlignText();
  header.font = title_font;
  header.textColor = TEXT_COLOR;
  return default_widget;
}

async function createErrorWidget(heading, text = "") {
  let error_widget = new ListWidget();
  error_widget.backgroundColor = new Color("#8B0000");

  let header = error_widget.addText(heading);
  header.centerAlignText();
  header.font = title_font;
  header.textColor = new Color("#ffffff");

  if (text){
    error_widget.addSpacer(5);
    let subtext = error_widget.addText(text);
    subtext.centerAlignText();
    subtext.font = small_font;
    subtext.textColor = new Color("#ffffff");
  }
  return error_widget;
}


// Widget small, single (only one counter)
async function createSmallWidgetSingle(platform, show_username = true) {
  var small_widget_single = new ListWidget();

  // set background and font color defaults
  let bg = ["color", BACKGROUND_COLOR];
  let font_color = TEXT_COLOR;
  let icon_version = "standard";

  switch(platform) {
    case "twitter":
      bg = ["color", new Color("#1d9bf0")];
      font_color = new Color("#ffffff");
      icon_version = "white";
      break;
    case "instagram":
      bg = ["gradient", ["#7635fa", "#9e19f3", "#b803ec", "#d300c9", "#d20da8", "#ea1972", "#f7363c", "#fd630d", "#ff6c08", "#ffb000", "#ffcf00"]];
      font_color = new Color("#ffffff");
      icon_version = "white";
      break;
    case "mastodon":
      bg = ["gradient", ["#6262fc", "#573ed1"]];
      font_color = new Color("#ffffff");
      icon_version = "white";
      break;
    case "facebook":
      bg = ["color", new Color("#1877f2")];
      font_color = new Color("#ffffff");
      icon_version = "white";
      break;
    case "youtube":
      icon_version = "standard";
      break;
  }

  // set background color or gradient
  if (bg[0] == "gradient"){
    // gradient
    let colors = bg[1]
    small_widget_single.backgroundGradient = createLinearGradient(bg[1]);
  } else {
    // color
    small_widget_single.backgroundColor = bg[1];
  }

  // load and add social icon
  var img = await getImageFor(platform, icon_version);
  var widget_image = small_widget_single.addImage(img);
  widget_image.imageSize = new Size(75, 75);
  widget_image.centerAlignImage();

  small_widget_single.addSpacer(10);

  // get and display follower count for specific platform
  let data = await getData(platform, HIDE_FOLLOWERS_LABEL);
  let display_follower_count = small_widget_single.addText(data);
  display_follower_count.centerAlignText();
  display_follower_count.font = bold_font;
  display_follower_count.minimumScaleFactor = 0.6;
  display_follower_count.textColor = font_color;

  if (show_username) {
    small_widget_single.addSpacer(1);
    let display_username = small_widget_single.addText("@" + getUsername(platform));
    display_username.centerAlignText();
    display_username.font = small_font;
    display_username.minimumScaleFactor = 0.8;
    display_username.textColor = font_color;
  }

  return small_widget_single;
}

// Widget small, multiple

// Widget medium, single

// Widget medium, multiple

// Runtime:
await downloadSocialIcons();

// PROGRAM LOGIC
// Check if cache file exists; write if doesen't.
if (!fm.fileExists(path)) {
  console.log("looks like your first init.");
  configFileFirstInit();

}

// default widget: error. Get overwritten in the next code block.
let widget = await createDefaultWidget("Please fill in config.");

// Widget Single or widget multiple?
if (display_mode == "error"){
  // display_mode == false => platform not found.
  widget = await createErrorWidget("Platform not found.", "Check widget parameters.");
} else if (display_mode.length > 1 || display_mode.includes("all")){
  //more than one platform to show
  switch (widget_size){
    case "large":
      // large single widget

      break;
    case "medium":
      // medium single widget

      break;
    default:
      // small single widget (or "null")
  }
} else {
  // only one platform to show
  console.log("only one platform to show.");
  let platform = display_mode[0];

  switch (widget_size){
    case "large":
      // large single widget

      break;
    case "medium":
      // medium single widget

      break;
    default:
      // small single widget (or "null")
      widget = await createSmallWidgetSingle(platform);
  }
}

// Check where the script is running
if (config.runsInWidget) {
  // Runs inside a widget so add it to the homescreen widget
  Script.setWidget(widget);
} else {
  // Show the medium widget inside the app
  widget.presentMedium();
}

Script.complete();
