'use strict';

window.el = {};
window.app = {
  expectedSales: {
    epic: 0,
    steam: 0,
    gog: 0,
    gmg: 0,
    itch: 0
  },
  shares: {
    epic: 12,
    steam: 30,
    gog: 30,
    gmg: 30,
    itch: 30
  },
  price: 0,
  funding: 0,
  platformProfits: 0,
  mainPlatform: '',
  platforms: {
    epic: 'Epic Store',
    steam: 'Steam',
    gog: 'GOG.com',
    gmg: 'GreenManGaming',
    itch: 'Itch.io'
  }
};

/**
 * Shorthand for the window.scrollTo function
 * @param $element
 */
function scrollToElement ($element) {
  window.scrollTo({top: $element.offsetTop, behavior: 'smooth'});
}

/**
 * Show the loader element
 * @param scrollTo Tell the app to scroll to the loader
 */
function showLoader (scrollTo) {
  window.el.$loader.classList.toggle('visible');
  window.el.$loader.classList.toggle('active');

  if (scrollTo === true) {
    scrollToElement(window.el.$loader);
  }
}

/**
 * Hode the loader element
 */
function hideLoader () {
  window.el.$loader.classList.toggle('active');
  window.setTimeout(function () {
    window.el.$loader.classList.toggle('visible');
  }, 200);
}

/**
 * Format a number to make it easier to read
 * @param number
 * @returns {*}
 */
function formatNumber (number) {
  return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
    .format(number);
}

/**
 * Calculate the sales for a platform
 * @param platform
 * @param includeFunding
 * @returns {{finalPrice: string, totalSales: string, platformProfit: string, profit: string, platformShare: string}}
 */
function calculateSales (platform, includeFunding = false) {
  var totalSales = (window.app.price * window.app.expectedSales[platform]).toFixed(2);

  var share = window.app.price / 100 * window.app.shares[platform];
  var finalPrice = (window.app.price - share).toFixed(2);

  var platformShare = (window.app.price - finalPrice).toFixed(2);
  var platformProfit = (window.app.expectedSales[platform] * platformShare).toFixed(2);

  var profit = window.app.expectedSales[platform] * finalPrice;

  if (includeFunding === true) {
    profit += window.app.funding;
  }

  profit = profit.toFixed(2);

  return {
    totalSales: totalSales,
    finalPrice: finalPrice,
    platformShare: platformShare,
    platformProfit: platformProfit,
    profit: profit
  };
}

function displayPlatformResult (platform, results, displayBonusHint = false) {
// Create a new platform profit from the template
  var $allPlatformResults = document.querySelector('.platform-results');
  var $resultTemplate = document.querySelector('.platform-result-template');
  var $newPlatform = $resultTemplate.cloneNode(true);

  $newPlatform.querySelectorAll('.platform-name').forEach(function ($element) {
    $element.innerHTML = window.app.platforms[platform];
  });

  $newPlatform.querySelector('.result-sales-total').innerHTML = formatNumber(results.totalSales);
  $newPlatform.querySelector('.result-single-profit').innerHTML = formatNumber(results.finalPrice);
  $newPlatform.querySelector('.result-platform-single-profit').innerHTML = formatNumber(results.platformShare);
  $newPlatform.querySelector('.result-platform-total-profit').innerHTML = formatNumber(results.platformProfit);
  $newPlatform.querySelector('.result-final-profit').innerHTML = formatNumber(results.profit);

  if (displayBonusHint === true) {
    $newPlatform.querySelector('.result-bonushint').style.display = 'block';
  }

  $newPlatform.className = 'result';

  $allPlatformResults.appendChild($newPlatform);

  return $newPlatform;
}

/**
 * Calculate the values for the epic store
 */
function calculatePrimaryPlatformResults () {
  var platform = window.app.mainPlatform;

  var results = calculateSales(platform, true);
  var $primaryResults = displayPlatformResult(platform, results, true);

  document.querySelector('.platform-results').style.display = 'block';

  scrollToElement($primaryResults);
}

/**
 * Calculate the values for each additional platform
 */
function calculateAdditionalPlatformResults () {
  window.el.$platformDetails.forEach(function ($details) {
    var platform = $details.dataset.platform;

    // Check if the platform is not the primary platform
    if (platform !== window.app.mainPlatform) {

      // Calculate the results only if the
      if ($details.querySelector('.checkbox').checked) {
        var results = calculateSales(platform, false);

        // Add the platform profit to the total profit
        window.app.platformProfits += results.profit;

        // Display the reults
        displayPlatformResult(platform, results);
      }
    }
  });
}

/**
 * Set the main platform which disables it for the "additional stores" select
 * @param platform
 */
function setMainPlatform (platform) {
  window.app.mainPlatform = platform;

  var $platformSelects = document.querySelectorAll('.platform-detail');
  var $mainPlatformDetail = document.querySelector('.platform-detail[data-platform=' + platform + ']');

  // Enable all selects
  $platformSelects.forEach(function ($select) {
    $select.querySelector('.checkbox').disabled = false;
  });

  // Disable the main platform
  $mainPlatformDetail.querySelector('.checkbox').checked = false;
  $mainPlatformDetail.querySelector('.checkbox').disabled = true;
}

window.onload = function () {
  console.log('Epic Shit Calculator v0.1 initialized');

  // Set global elements
  window.el.$loader = document.querySelector('.loader');
  window.el.$form = document.querySelector('.form');
  window.el.$platformDetails = document.querySelectorAll('.platform-detail');
  window.el.$platformResults = document.querySelector('.platform-results');
  window.el.$totalResults = document.querySelector('.total-results');
  var $mainPlatformSelect = document.querySelector('#main-platform');

  // Reset the form
  window.el.$form.reset();

  // Add handler for changing the main platform
  $mainPlatformSelect.addEventListener('change', function () {
    var selectedIndex = $mainPlatformSelect.selectedIndex;
    var selectedValue = $mainPlatformSelect.options[selectedIndex].value;

    setMainPlatform(selectedValue);
  });

  // Set the initial option
  setMainPlatform($mainPlatformSelect.options[0].value);

  // Handle platform selects
  window.el.$platformDetails.forEach(function ($details) {
    var $checkbox = $details.querySelector('.checkbox');
    var $salesInput = $details.querySelector('.form-input');

    $salesInput.disabled = true;

    // Listen to checkbox clicks
    $checkbox.addEventListener('change', function () {
      $salesInput.disabled = !$checkbox.checked;
    });
  });

  // Handle the form submit
  window.el.$form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Reset all error mesages
    document.querySelectorAll('.form-errors p').forEach(function ($message) {
      $message.style.display = 'none';
    });

    // Empty the existing results / hide total results
    window.el.$platformResults.innerHTML = '';
    window.el.$totalResults.style.display = 'none';

    // Check if at least one additional platform was selected
    var $activeAdditionalPlatforms = document.querySelector('.platform-detail .checkbox:checked');
    if ($activeAdditionalPlatforms === null) {
      document.querySelector('.error-no-platform').style.display = 'block';
      return;
    }

    // Collect all values for the main platform
    var mainPlatform = window.app.mainPlatform;
    var mainExpectedSales = document.querySelector('#expected-sales').value;
    var price = document.querySelector('#price').value;
    var funding = document.querySelector('#funding').value;

    window.app.expectedSales[mainPlatform] = parseInt(mainExpectedSales);
    window.app.price = parseInt(price);
    window.app.funding = parseInt(funding);

    // Collect expected sales for additional platforms
    window.el.$platformDetails.forEach(function ($details) {
      var platform = $details.dataset.platform;

      if (
        platform !== window.app.mainPlatform
        && $details.querySelector('.checkbox').checked
      ) {
        var expectedSales = $details.querySelector('.form-input').value;
        window.app.expectedSales[platform] = parseInt(expectedSales);
      }
    });

    // Run the calculation and show the results
    showLoader(true);

    window.setTimeout(function () {
      hideLoader();

      // Calculate the total profit expected from the epic store
      calculatePrimaryPlatformResults();

      // Calculate the profits for each selected platform
      calculateAdditionalPlatformResults();

      // Calculate the difference between the profits
      // @TODO

    }, 2000);
  });
};
