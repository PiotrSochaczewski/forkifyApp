import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './view/recipeView.js';
import searchView from './view/searchView.js';
import resultsView from './view/resultsView.js';
import bookmarksView from './view/bookmarksView.js';
import paginationView from './view/paginationView.js';
import addRecipeView from './view/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime.js';
import { async } from 'regenerator-runtime';

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner(model.state.bookmarks);

    //0 Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //1 Updating bookmarks view

    bookmarksView.update(model.state.bookmarks);

    //2 Loading recipe
    await model.loadRecipe(id);

    //3.render recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResult = async function () {
  try {
    resultsView.renderSpinner();
    //1)Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2) load search result
    await model.loadSearchResult(query);

    //3)render results
    // console.log(model.state.search.results)
    resultsView.render(model.getSearchResultsPage(1)); //

    //4.render initial paginaiton buttons:
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //1.Render New results
  resultsView.render(model.getSearchResultsPage(goToPage)); //

  //2.Render New pagination buttons
  recipeView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update the recipe servings
  model.updateServings(newServings);

  // //update the recipe view
  // recipeView.render(model.state.recipe);
  //update the recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //Add remove bookmarks
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //Update recipe view
  recipeView.update(model.state.recipe);
  //3.render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const contorlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecipeView.renderSpinner();


    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe)

    //render recipe
    recipeView.render(model.state.recipe)

    //success message
    addRecipeView.renderMessage();

    //render bookmarkview
    bookmarksView.render(model.state.bookmarks)

    //Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`)
    

    //close form window
    setTimeout(function() {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('*', err)
    addRecipeView.renderError(err.message)
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResult);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(contorlAddRecipe);
};
init();
