import * as model from './model';
import recipeViews from './views/recipeViews';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
if (module.hot) {
  module.hot.accept();
}

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async () => {
  try {
    const id = window.location.hash.slice(1);
    console.log(id);
    if (!id) return;
    recipeViews.renderSpinner();
    //0 Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    // 1) loading recipe
    await model.loadRecipe(id);
    // 2) rendering recipe
    recipeViews.render(model.state.recipe);
  } catch (error) {
    recipeViews.renderError();
  }
};
const controlSearchResults = async () => {
  try {
    //1) get search query
    const query = searchView.getQuery();
    if (!query) return;
    resultsView.renderSpinner();
    //2) load search results
    await model.searchLoadResults(query);
    //3) render results
    resultsView.render(model.getSearchResultsPage());
    //4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (error) {
    console.error(error);
  }
};
const controlPagination = goToPage => {
  //render new results
  resultsView.render(model.getSearchResultsPage(goToPage));
  // Render new pagination buttons
  paginationView.render(model.state.search);
};
const controlServings = newServings => {
  // update the recipe servings (in state)
  model.updateServings(newServings);
  // update the recipe view
  recipeViews.update(model.state.recipe);
};
const controlAddBookmark = () => {
  //Add/Remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // Update recipe view
  recipeViews.update(model.state.recipe);
  //Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = () => {
  bookmarksView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecipeView.renderSpinner();
    //upload the new recipe
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    //Render recipe
    recipeViews.render(model.state.recipe);
    // Success message
    addRecipeView.renderMessage();
    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);
    // Change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //Close form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, 2500);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err);
  }
};

const init = () => {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeViews.addHandlerRecipe(controlRecipes);
  recipeViews.addHandlerUpdateServings(controlServings);
  recipeViews.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
