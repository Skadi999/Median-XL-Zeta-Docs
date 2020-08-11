/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function clickConcepts() {
  document.querySelector('#conceptDropdown').classList.toggle('show');
  unShowDropDown('characterDropdown');
  unShowDropDown('itemDropdown');
  unShowDropDown('uberDropdown');
  unShowDropDown('challengeDropdown');
  unShowDropDown('mapDropdown');
  unShowDropDown('miscDropdown');
}

function clickCharacters() {
  document.querySelector('#characterDropdown').classList.toggle('show');
  unShowDropDown('conceptDropdown');
  unShowDropDown('itemDropdown');
  unShowDropDown('uberDropdown');
  unShowDropDown('challengeDropdown');
  unShowDropDown('mapDropdown');
  unShowDropDown('miscDropdown');
}

function clickItems() {
  document.querySelector('#itemDropdown').classList.toggle('show');
  unShowDropDown('conceptDropdown');
  unShowDropDown('characterDropdown');
  unShowDropDown('uberDropdown');
  unShowDropDown('challengeDropdown');
  unShowDropDown('mapDropdown');
  unShowDropDown('miscDropdown');
}

function clickUbers() {
  document.querySelector('#uberDropdown').classList.toggle('show');
  unShowDropDown('conceptDropdown');
  unShowDropDown('characterDropdown');
  unShowDropDown('itemDropdown');
  unShowDropDown('challengeDropdown');
  unShowDropDown('mapDropdown');
  unShowDropDown('miscDropdown');
}

function clickChallenges() {
  document.querySelector('#challengeDropdown').classList.toggle('show');
  unShowDropDown('conceptDropdown');
  unShowDropDown('characterDropdown');
  unShowDropDown('itemDropdown');
  unShowDropDown('uberDropdown');
  unShowDropDown('mapDropdown');
  unShowDropDown('miscDropdown');
}

function clickMaps() {
  document.querySelector('#mapDropdown').classList.toggle('show');
  unShowDropDown('conceptDropdown');
  unShowDropDown('characterDropdown');
  unShowDropDown('itemDropdown');
  unShowDropDown('uberDropdown');
  unShowDropDown('challengeDropdown');
  unShowDropDown('miscDropdown');
}

function clickMisc() {
  document.querySelector('#miscDropdown').classList.toggle('show');
  unShowDropDown('conceptDropdown');
  unShowDropDown('characterDropdown');
  unShowDropDown('itemDropdown');
  unShowDropDown('uberDropdown');
  unShowDropDown('challengeDropdown');
  unShowDropDown('mapDropdown');
}

function unShowDropDown(dropDownID) {
  var otherDropDown = document.querySelector(`#${dropDownID}`);
  otherDDEnabled = otherDropDown.classList.contains('show');
  if(otherDDEnabled) otherDropDown.classList.toggle('show');
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches('.btnDropdown')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
} 