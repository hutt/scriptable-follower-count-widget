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
var twitter = "jankortemdb";
var mastodon = "jankorte@social.linksfraktion.de";
var instagram = "jankorte77";
var facebook = "jankortemdb";
var youtube = "jankortemdb";

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

async function saveData(data) {
  data.savedDate = Date.now();
  fm.writeString(path, JSON.stringify(data));
  console.log("saved new data to file");
}

async function getFromFile() {
  await fm.downloadFileFromiCloud(path);
  data = await JSON.parse(fm.readString(path));
  console.log("fetching data from file was successful");
  return data;
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

async function getData(platform, append_followers = true) {
  let data = 1234;
  let followers_name = "Followers";
  // Check if there is a cache file & cache file time stamp
  // data = getDataFromCache(platform);

  // If there is no cache file or time stamp is too old, load data:
  switch (platform) {
    case "twitter":
      //data = loadTwitterFollowers();
      followers_name = "Followers";
      break;
    case "mastodon":
      //data = loadMastodonFollowers();
      followers_name = "Followers";
      break;
    case "instagram":
      //data = loadInstagramFollowers();
      followers_name = "Followers";
      break;
    case "facebook":
      //data = loadFacebookFans();
      followers_name = "Likes";
      break;
    case "youtube":
      //data = loadYouTubeSubscribers();
      followers_name = "Subscribers";
      break;
    default:
      console.error("getData(): ", "platform not found.");
  }
  // writeDataToCache(platform, data);

  // Format Data
  let data_string = parseInt(data).toLocaleString(); 
  if (append_followers) {
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
    let set_username = setUsername(platforms[i], new_username);
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
  let data = await getData(platform);
  let display_follower_count = small_widget_single.addText(data);
  display_follower_count.centerAlignText();
  display_follower_count.font = bold_font;
  display_follower_count.minimumScaleFactor = 0.6;
  display_follower_count.textColor = font_color;

  if (show_username) {
    small_widget_single.addSpacer(3);
    let display_username = small_widget_single.addText("@" + getUsername(platform));
    display_username.centerAlignText();
    display_username.font = small_font;
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
// default widget: error. Get overwritten in the next code block.
let widget = await createDefaultWidget("Please fill in config.");

// Widget Single or widget multiple?
if (display_mode == "error"){
  // display_mode == false => platform not found.
  widget = await createErrorWidget("Platform not found.", "Check widget parameters.");
} else if (display_mode.length > 1 || display_mode.includes("all")){
  //more than one platform to show
  console.log("more than one platform to show.");
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