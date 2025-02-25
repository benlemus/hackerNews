"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  let showStar = Boolean(currentUser);
  let showDeleteBtn = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        <div>
        ${showDeleteBtn ? getDeleteBtn() : ""}
        ${showStar ? getStar(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <div class="story-author">by ${story.author}</div>
        <div class="story-user">posted by ${story.username}</div>
        </div>
      </li>
      <hr>
    `);
}

function getDeleteBtn() {
  return `
      <span class="trash-can">
          <i class="fas fa-trash-alt"></i>
      </span>`;
}

function getStar(story, user) {
  const isFavorite = user.isFavorite(story);

  try {
    const returnedJson = localStorage.getItem("favorites");
    const returnedList = JSON.parse(returnedJson);

    if (returnedList.length != 0) {
      for (let i = 0; i <= returnedList.length - 1; i++) {
        if (story.storyId == returnedList[i].storyId) {
          return `
          <span class="star">
            <i class="fas fa-star"></i>
          </span>`;
        }
      }
    }
  } catch (Exception) {
    console.debug("Error reading returned list in getStar");
  }
  const starType = isFavorite ? "fas" : "far";
  return `
  <span class="star">
    <i class="${starType} fa-star"></i>
  </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// Creates new story with form input, adds to list
async function getAndShowNewStory(e) {
  e.preventDefault();

  const title = $("#title-input").val();
  const author = $("#author-input").val();
  const url = $("#url-input").val();

  const username = currentUser.username;
  const data = { title, author, url, username };

  const newStory = await storyList.addStory(currentUser, data);
  currentUser.addStoryToOwnStories(newStory);

  const createdStory = generateStoryMarkup(newStory);
  $allStoriesList.prepend(createdStory);

  $newStoryForm[0].reset();
}

$newStoryForm.on("submit", getAndShowNewStory);

// shows fav stories
function putFavoriteStoriesOnPage() {
  console.debug("putFavStoriesOnPage");

  $favStoriesList.empty();

  try {
    const returnedJson = localStorage.getItem("favorites");
    const returnedList = JSON.parse(returnedJson);

    const stories = [];

    if (returnedList.length == 0) {
      $favStoriesList.append("<h3>No stories added to favorites</h3>");
    }

    for (let i = 0; i <= returnedList.length - 1; i++) {
      stories.push(new Story(returnedList[i]));
    }

    for (let i = 0; i <= stories.length - 1; i++) {
      const story = generateStoryMarkup(stories[i]);
      $favStoriesList.append(story);
    }
  } catch (Exception) {
    $favStoriesList.append("<h3>No stories added to favorites</h3>");
  }

  $favStoriesList.show();
}

function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage");

  $ownStoriesList.empty();

  try {
    const returnedJson = localStorage.getItem("ownStories");
    const returnedList = JSON.parse(returnedJson);

    const stories = [];

    if (returnedList.length == 0) {
      $ownStoriesList.append("<h3>No stories submitted</h3>");
    }

    for (let i = 0; i <= returnedList.length - 1; i++) {
      stories.push(new Story(returnedList[i]));
    }

    for (let i = 0; i <= stories.length - 1; i++) {
      const story = generateStoryMarkup(stories[i]);
      $ownStoriesList.append(story);
    }
  } catch (Exception) {
    // $ownStoriesList.append("<h3>No stories added</h3>");
  }

  $ownStoriesList.show();
}

// toggle fav
async function toggleStoryFavorite(e) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(e.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  if ($tgt.hasClass("fas")) {
    await currentUser.removeStoryFromFavorites(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addStoryToFavorites(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$allLists.on("click", ".star", toggleStoryFavorite);

// delete story
async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  const story = storyList.stories.find((s) => s.storyId === storyId);

  currentUser.removeStoryFromOwnStories(story);
  currentUser.removeStoryFromFavorites(story);

  // re-generate story list
  await putStoriesOnPage();
}
$ownStoriesList.on("click", ".trash-can", deleteStory);
$allLists.on("click", ".trash-can", deleteStory);
