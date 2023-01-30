// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: desktop;
// Social Media Followers Count Widget for Scriptable by Jannis Hutt
// GitHub Repository: https://github.com/hutt/scriptable-follower-count-widget

// ### INFO: WIDGET PARAMETERS ###
// parameters are seperated by a semicolon (";" or "; ").
// example widget parameter strings: "display:twitter", "display:twitter,instagram; instagram:aluhutt.jpg", "display:twitter; hidefollowers:true"
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
//
// - hide "Followers" / "Subscribers" label (optional; default: set below)
//   prefix: "hidelabel"
//   possible values: "true", "false"
//   examples: "hidelabel:true", "hidelabel" (interpreted like hidelabel:true), "hidelabel:false"
// 
// ####### SETUP #######
// Store Cache File locally or in iCloud Drive?
const STORE_CACHE = "icloud"; // options: icloud, local

// Default usernames
// (can be overwritten by widget parameters (see above))
var twitter = "linksfraktion";
var mastodon = "linksfraktion@social.linksfraktion.de";
var instagram = "linksfraktion";
var facebook = "linksfraktion";
var youtube = "linksfraktion";

// Append "Followers" or "Subscribers" behind the number?
var hide_followers_label = true;

// Hide username in the widgets?
const HIDE_USERNAME = false;

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
const SOCIAL_ICONS_FILENAMES = ["facebook", "facebook_white", "instagram", "instagram_white", "mastodon", "mastodon_white", "twitter", "twitter_white", "youtube", "youtube_white"];
const REQUEST_TIMEOUT = 3; // how many seconds until timeout when downloading social icons?

// HELPER FUNCTIONS
// Validate Parameters
function validateParameters(parameters) {
  let check_for = ["display", "twitter", "mastodon", "instagram", "facebook", "youtube"];
  let contains_keyword = false;
  for (keyword of check_for) {
    if(parameters.includes(keyword)){
      contains_keyword = true;
    }
  }
  return contains_keyword;
}

// Get display parameter
function getDisplayParameters(parameters) {
  let platforms = null;
  if (validateParameters(parameters)){
    // parameters are valid
    let available_platforms = ["twitter", "mastodon", "instagram", "facebook", "youtube", "all"];
    let regex = /display:([\w,]+)[;\s]*/gi;
    let parameter_string = regex.exec(parameters);
    let parameter_value = parameter_string[1];
    platforms = parameter_value.split(",");
    for (let platform of platforms){
      if (!available_platforms.includes(platform)){
        platforms = "error";
      }
    }
  } else {
    // parameters are not valid
    platforms = "error";
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
      followers: 0
    });
  }

  // write mastodon username to cache  (if set)
  if (mastodon) {
    data.cached.push({
      timestamp: outdated_timestamp,
      platform: "mastodon",
      username: mastodon,
      followers: 0
    });
  }

  // write instagram username to cache  (if set)
  if (instagram) {
    data.cached.push({
      timestamp: outdated_timestamp,
      platform: "instagram",
      username: instagram,
      followers: 0
    });
  }

  // write facebook username to cache  (if set)
  if (facebook) {
    data.cached.push({
      timestamp: outdated_timestamp,
      platform: "facebook",
      username: facebook,
      followers: 0
    });
  }

  // write youtube username to cache  (if set)
  if (youtube) {
    data.cached.push({
      timestamp: outdated_timestamp,
      platform: "youtube",
      username: youtube,
      followers: 0
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

function getMastodonUsernameWithoutInstanceUrl(username){
  let regex = /^([\w]+)\@([\w\.]+)$/gi;
  username = regex.exec(username)[1];
  return username;
}

function getMastodonInstanceUrl(username){
  let regex = /^([\w]+)\@([\w\.]+)$/gi;
  let instance_url = regex.exec(username)[2];
  return instance_url;
}

// get profile url
function getProfileUrl(platform) {
  let url = "https://";
  let username = getUsername(platform);
  switch (platform){
    case "twitter":
      url += "twitter.com";
      break;
    case "mastodon":
      url += getMastodonInstanceUrl(username);
      username = "@" + getMastodonUsernameWithoutInstanceUrl(username);
      break;
    case "instagram":
      url += "instagram.com";
      break;
    case "facebook":
      url += "facebook.com";
      break;
    case "youtube":
      url += "youtube.com";
      username = "@" + username;
    break;
  }
  url += "/" + username;
  return url;
}

function createLinearGradient(colors) {
    let gradient = new LinearGradient();

    let num_locations = colors.length;
    let locations_array = [];
    let colors_array = [];
    for (let i = 0; i < num_locations - 1; i++) {
      let color_location = i * (1 / (num_locations - 1));
      color_location = color_location.toFixed(6);
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
	// requesting data
	// building request url
  let url = "https://";
  url += getMastodonInstanceUrl(user);
  url += "/api/v1/accounts/lookup?acct=";
  url += getMastodonUsernameWithoutInstanceUrl(user);
  
  let request = new Request(url);
  let data = await request.loadJSON();
  let followers = data.followers_count;

  return followers;
}

async function loadInstagramFollowers(user) {
  return 1234;
}

async function loadFacebookFans(user) {
  return 1234;
}

async function loadYouTubeSubscribers(user) {
	// 1. get list of running invidious instances
  let instance_api_url = "https://api.invidious.io/instances.json?pretty=1&sort_by=health,api,users";
  let request = new Request(instance_api_url);
  let data = await request.loadJSON();

  // 2. select random, sufficiently healthy instance
  let random_int = Math.floor(Math.random()*7); // random integer between 0-7
  let selected_instance_domain = data[random_int][0];
  let api_url = "https://" + selected_instance_domain;
  
  // 3. search for channels with that username
  let request_cid_url = api_url + "/api/v1/search?type=channel&q=" + encodeURI(user) + "&fields=authorId";
  
  request = new Request(request_cid_url);
  data = await request.loadJSON();
  let cid = data[0].authorId;

  // 4. get subscription count from instance api
  let request_subscribers_url = api_url + "/api/v1/channels/" + cid + "?fields=subCount";
  
  request = new Request(request_subscribers_url);
  data = await request.loadJSON();

  return data.subCount;
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

    let new_data_object = new Object();
    new_data_object.timestamp = Date.now();
    new_data_object.platform = platform;
    new_data_object.username = username;
    new_data_object.followers = await data;

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
if (!parameters){
  parameters = "display:all";
}

if parameters.includes("hidelabel") {
  let regex = /hidelabel\:([\w\d]+)[\;\s]*|/gi;
  let value = regex.exec(parameters);
  
  if (value[1] == "true" || value[1] == "1" || value[2] == "hidelabel") {
    hide_followers_label = true;
  }

  if (value[1] == "false" || value[1] == "0") {
    hide_followers_label = false;
  }

}

let display_mode = getDisplayParameters(parameters);

// check if the platform named after "display:" ist valid
if (display_mode == "error") {
  console.error("specified platform not found (or you forgot a \";\" to seperate the display parameter from a username.");
} else {
  console.log("showing follower count for the following platform(s): " + display_mode.join(", "));
}

// social media username parameters
let platforms = ["twitter", "mastodon", "instagram", "facebook", "youtube"];
for (let i = platforms.length - 1; i >= 0; i--) {
  // if social network name is found in parameter string, overwrite username variable with matched username string
  if (parameters.includes(platforms[i] + ":")) {
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
let bold_font = Font.blackSystemFont(20);
let title_font = Font.heavySystemFont(16);

// WIDGETS
async function createDefaultWidget(heading, text = "") {
  let default_widget = new ListWidget();
  default_widget.backgroundColor = BACKGROUND_COLOR;

  let header = default_widget.addText(heading);
  header.centerAlignText();
  header.font = title_font;
  header.textColor = TEXT_COLOR;

  if (text){
    default_widget.addSpacer(5);
    let subtext = default_widget.addText(text);
    subtext.centerAlignText();
    subtext.font = small_font;
    subtext.textColor = TEXT_COLOR;
  }

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
      bg = ["gradient", ["#4f5bd5", "#962fbf", "#d62976", "#fa7e1e", "#feda75"]];
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
  widget_image.imageSize = new Size(64, 64);
  widget_image.centerAlignImage();

  small_widget_single.addSpacer(10);

  // get and display follower count for specific platform
  let data = await getData(platform, hide_followers_label);
  let display_follower_count = small_widget_single.addText(data);
  display_follower_count.centerAlignText();
  display_follower_count.font = bold_font;
  display_follower_count.minimumScaleFactor = 0.8;
  display_follower_count.textColor = font_color;

  if (show_username) {
    small_widget_single.addSpacer(1);
    let display_username = small_widget_single.addText("@" + getUsername(platform));
    display_username.centerAlignText();
    display_username.font = small_font;
    display_username.minimumScaleFactor = 0.4;
    display_username.textColor = font_color;
  }

  small_widget_single.url = getProfileUrl(platform);

  return small_widget_single;
}

// Widget small, multiple
async function createSmallWidgetMultiple(platforms, show_username = true) {
  var small_widget_multiple = new ListWidget();

  // set background and font color defaults
  let bg = ["color", BACKGROUND_COLOR];
  let font_color = TEXT_COLOR;
  let icon_version = "white";

  // set background color
  small_widget_multiple.backgroundColor = BACKGROUND_COLOR;

  // Determine font size based on number of items
  let item_num = platforms.length;
  let font_size = 20 - item_num;;
  let followers_count_font = Font.blackSystemFont(font_size);

  // get platforms
  for (platform of platforms) {
    var widget_stack = small_widget_multiple.addStack();
    widget_stack.layoutHorizontally();

    widget_stack.setPadding(2,0,2,0);

    var img = await getImageFor(platform, icon_version);
    var widget_image = widget_stack.addImage(img);
    widget_image.tintColor = TEXT_COLOR;
    widget_image.imageSize = new Size(font_size, font_size);
    widget_image.centerAlignImage();

    widget_stack.addSpacer(4+(0.4*item_num));

    // get and display follower count for specific platform
    let data = await getData(platform, hide_followers_label);
    let display_follower_count = widget_stack.addText(data);
    display_follower_count.leftAlignText();
    display_follower_count.font = followers_count_font;
    display_follower_count.textColor = font_color;

    // display username
    /**
    if (show_username) {
      //widget_stack.addSpacer();
      let display_username = widget_stack.addText(" (@" + getUsername(platform) + ")");
      display_username.leftAlignText();
      display_username.font = thin_font;
      display_username.minimumScaleFactor = 0.8;
      display_username.textColor = font_color;
    }
    **/

    // link stack to profile url
    widget_stack.url = getProfileUrl(platform);
  }

  return small_widget_multiple;
}

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
  widget = await createErrorWidget("Error", "Check widget parameters.");
} else if (display_mode.length > 1 || display_mode.includes("all")){
  //more than one platform to show
  let platforms = [];
  let available_platforms = ["twitter", "mastodon", "instagram", "facebook", "youtube"];
  if (display_mode.includes("all")) {
    platforms = available_platforms;
  } else {
    platforms = display_mode;
  }

  switch (widget_size){
    case "large":
      // large multi widget

      break;
    case "medium":
      // medium multi widget

      break;
    default:
      // small multi widget (or "null")
      widget = await createSmallWidgetMultiple(platforms, !HIDE_USERNAME);
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
      widget = await createSmallWidgetSingle(platform, !HIDE_USERNAME);
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
