/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction(a) {
  document.querySelector('#conceptDropdown').classList.toggle('show');
  unShowDropDown('characterDropdown');
}

function myFunctionTwo(a) {
  document.querySelector('#characterDropdown').classList.toggle('show')
  unShowDropDown('conceptDropdown');
}

function unShowDropDown(dropDownID) {
  var otherDropDown = document.querySelector(`#${dropDownID}`);
  otherDDEnabled = otherDropDown.classList.contains('show')
  if(otherDDEnabled) otherDropDown.classList.toggle('show')
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