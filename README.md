# Follower count widget for Scriptable App (iOS/iPad OS)
A simple widget to display social media follower counts using [simonbs](https://github.com/simonbs)' app [scriptable](https://scriptable.app).

## Functionality
* display follower/like/subscriber count for:
	* Twitter
	* Mastodon
	* Instagram
	* Facebook
	* YouTube
* create widgets for multiple accounts on the same platform using parameters
* cache follower counts and use old values if there's an api error (which may happen more often, since every platform except Mastodon closed their public apis)
* see a graph of your followers over time (in development)

# Screenshots
| daytime | nighttime |
| ------- | --------- |
| ![Screenshot: small widgets by day](screenshots/widgets_small_daytime.png) | ![Screenshot: small widgets by night](screenshots/widgets_small_nighttime.png) |

| medium-sized widgets with follower graph | medium-sized multi-widget and large widget with follower graph |
| ---------------------------------------- | -------------------------------------------------------------- |
| ![Screenshot: medium-sized widgets with follower graph](screenshots/single_medium_widgets.png) | ![Screenshot: medium-sized multi-widget and large widget with follower graph](screenshots/multiple_medium_and_single_large_widgets.png) |

| use parameters to display multiple accounts | parameters for the widget on the top right (display twitter & override default twitter account with "aluhutt": `display:twitter; twitter:aluhutt` |
| ------------------------------------------- | ---------------------------------- |
| ![Screenshot: multiple small twitter widgets](screenshots/multiple_small_twitter_widgets.png) | ![Screenshot: multiple small twitter widget parameters](screenshots/multiple_small_twitter_widgets_parameters.png) |

# Installation
1. install [scriptable](https://scriptable.app)
2. copy follower-count.js to your scriptable folder in iCloud or copy the code directly into a new script in the scriptable app
3. fill in your preferred default usernames in the setup section in the beginning of the script

# Usage
1. create a scriptable widget on your homescreen (chosse follower-count.js)
2. fill in parameters (optional)
3. wait a few seconds until all data is fetched

## Parameters
parameters allow you to customize your widgets. they're seperated by a semicolon (`;` or `; `).
example widget parameter strings: `display:twitter`, `display:twitter,instagram; instagram:aluhutt.jpg`, `display:twitter; hidelabel:true`.
| **prefix**                                                               | **value(s)**                                                                                                 | **examples**                                                                                                                   | **explanation**                                                                                                                                                                         |
|--------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `display` | `twitter`, `mastodon`, `instagram`, `facebook`, `youtube`, `all`, or a combination, e.g. `twitter,instagram`. | `display:twitter`, `display:twitter,instagram`, `display:all` | choose social network(s) to display (optional; default: `all`) |
| network name (`twitter`, `mastodon`, `instagram`, `facebook`, `youtube`) | your username (without a leading "@") | `display:twitter; twitter:aluhutt`, `mastodon:jannis@hutt.social`, `display:all; mastodon:jannis@hutt.social; twitter:aluhutt` | overwrite username(s) (optional; overwrites default usernames in the config section below). this allows you to create widgets for different accounts on the same social media platform. |
| `hidelabel` | `true`, `false` | `hidelabel:true`, `hidelabel` (interpreted like `hidelabel:true`), `hidelabel:false` | hide "followers" / "subscribers" label (optional; default: set in the script's setup section) |

# Development 
## Roadmap
- [x] find "ways" (api hacks) to get data from the initial five platforms
- [x] create small widget that displays only one platform
- [x] create small widget that displays multiple platforms
- [x] write cache function that allows caching of followers over time (prerequisite for the graph feature)
- [x] create medium-sized widget that displays only one platform + graph
- [x] create medium-sized widget that displays multiple platforms
- [x] create large-sized widget that displays only one platform + graph
- [ ] create large-sized widget that displays multiple platforms
- [x] better error reporting
- [ ] add support for more platforms (e.g. Flickr)
- [ ] add support for more metrics than just follower counts

## Known Bugs
no bug tracked yet. create an issue to let me know.
