"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $loginForm.hide();
  $signupForm.hide();
  $navSubmit.show();
  $navfavorites.show();
  $navMyStories.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function navSubmitClick(e) {
  console.debug("navSubmitClick", e);

  hidePageComponents();
  $newStoryForm.show();
}

$navSubmit.on("click", navSubmitClick);

function navFavoriteClick(e) {
  console.debug("navFavoritesClick", e);

  hidePageComponents();
  putFavoriteStoriesOnPage();
}

$navfavorites.on("click", navFavoriteClick);

// TO DO: ON NAV MY STORIES CLICK: SHOW OWN STORIES

function navMyStoriesClick(e) {
  console.debug("navMyStoriesClick", e);

  hidePageComponents();
  putMyStoriesOnPage();
}

$navMyStories.on("click", navMyStoriesClick);
