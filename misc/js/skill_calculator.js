var currentClass = "amazon";
var totalSkillPoints = 119;
var spentSkillPoints = 0;
var maxSkills = 0;
var domCheckboxes = []
var domSkills = []

const baseSkillPoints = 119;
const baseMaxSkills = 0;
//shift click to max skill

function update() {
  setPoints();
  setSkillMaxPoints();
  fixInputsAboveMax();
  lockButtons();
}

function changeClass(value) {
  switch (value) {
    case "amazon": setClassSkills(amazon);
      break;
    case "assassin": setClassSkills(assassin);
      break;
    case "barbarian": setClassSkills(barbarian);
      break;
    case "druid": setClassSkills(druid);
      break;
    case "necromancer": setClassSkills(necromancer);
      break;
    case "paladin": setClassSkills(paladin);
      break;
    case "sorceress": setClassSkills(sorceress);
      break;
    default:
      setClassSkills(amazon);
      break;
  }
  currentClass = value;
}

function disableTextFields() {
  for (let i = 0; i < domSkills.length; i++) {
    var txt = domSkills[i].getElementsByTagName("INPUT")[0]
    txt.disabled = true;
  }
}

function setClassSkills(classArray) {
  //disables Venefica checkbox if sorc class isn't selected
  if (classArray === sorceress) {
    document.getElementById("trVenefica").style.display = "table-row";
  }
  else {
    document.getElementById("trVenefica").style.display = "none";
    document.getElementById("venefica").checked = false;
  }

  //these contain the <td>s that contain the skill images in html.
  var domImages = document.getElementsByClassName("tdImg");

  //sets the name and image of the skill in html. pulls data out of the respective class array
  for (let i = 0; i < domSkills.length; i++) {
    domSkills[i].getElementsByClassName("name")[0].innerHTML = classArray[i].name;
    domImages[i].getElementsByTagName("IMG")[0].src = classArray[i].imgPath;
  }
  update();
}

//for each checkbox that is checked, increases skill pts and max skill pts by the appropriate value
function setPoints() {
  resetPoints();

  domCheckboxes = document.getElementsByName("checkbox");
  domSkills = document.getElementsByClassName("skill");

  resetEnneadAndBrcIfNeeded();

  for (let i = 0; i < domCheckboxes.length; i++) {
    setPointsPerCheckbox(domCheckboxes[i].id);
  }

  updatePointsTexts();
}

function resetPoints() {
  totalSkillPoints = baseSkillPoints;
  maxSkills = baseMaxSkills;
}

function setPointsPerCheckbox(id) {

  var checkbox = getCheckboxById(id);

  if (document.getElementById(id).checked) {
    totalSkillPoints += checkbox.skillPoints;
    maxSkills += checkbox.maxSkillLevels;
  }
}

//Resets the Ennead and/or BRC skills back to 0 if the appropriate checkbox is unchecked while these skills had points invested.
function resetEnneadAndBrcIfNeeded() {
  if (!document.getElementById("ennead").checked && getSkillById("2_4").spentPointsInSkill > 0) {
    spentSkillPoints -= getSkillById("2_4").spentPointsInSkill
    getSkillById("2_4").spentPointsInSkill = 0;
    document.getElementById("skill1_8").value = 0;
  }
  if (!document.getElementById("blackRoad").checked && getSkillById("2_5").spentPointsInSkill > 0) {
    spentSkillPoints -= getSkillById("2_5").spentPointsInSkill
    getSkillById("2_5").spentPointsInSkill = 0;
    document.getElementById("skill1_10").value = 0;
  }
}

function getCheckboxById(id) {
  for (let i = 0; i < pointRewards.length; i++) {
    if (pointRewards[i].id === id) return pointRewards[i];
  }
}


function setSkillMaxPoints() {
  for (let i = 0; i < domSkills.length; i++) {
    var basemax = getSkillById(domSkills[i].id).baseMaxPoints;

    domSkills[i].getElementsByClassName("max")[0].innerHTML = basemax + maxSkills +
      getSkillBonusPoints(getSkillById(domSkills[i].id));
  }
}

function fixInputsAboveMax() {
  for (let i = 0; i < domSkills.length; i++) {
    var skill = getSkillById(domSkills[i].id);

    var totalSkillMaxPts = getTotalMaxSkillPointsPerSkill(skill);

    var txt = domSkills[i].getElementsByTagName("INPUT")[0]

    if (parseInt(txt.value) > totalSkillMaxPts) {
      skill.spentPointsInSkill = totalSkillMaxPts;
      var difference = parseInt(txt.value) - totalSkillMaxPts;
      txt.value = totalSkillMaxPts;
      spentSkillPoints -= difference;
    }
  }

  updatePointsTexts();
}

function getSkillBonusPoints(skill) {
  if (currentClass === "amazon" && skill.id === "3_4") {
    return Math.floor((getSkillById("3_1").spentPointsInSkill +
      getSkillById("3_2").spentPointsInSkill +
      getSkillById("3_3").spentPointsInSkill +
      getSkillById("3_5").spentPointsInSkill) / 2);
  } else if (currentClass === "barbarian" && getSkillById("1_2").spentPointsInSkill > 0) {
    return 1 + Math.floor(getSkillById("1_2").spentPointsInSkill / 4);
  }
  else
    return 0;
}

function getTotalMaxSkillPointsPerSkill(skill) {
  return maxSkills + skill.baseMaxPoints + getSkillBonusPoints(skill);
}

//The main function responsible for locking (disabling) buttons. 
//Relies on more specific functions that have different conditions for locking.
function lockButtons() {
  for (let i = 0; i < domSkills.length; i++) {
    var skill = getSkillById(domSkills[i].id);

    lockSkillByCondition(skill)
    disableBtnIfSkillLocked(skill, i, isLockMinusButton(skill));
  }
}

//Tests whether the + button should be locked
function lockSkillByCondition(skill) {
  if (skill.spentPointsInSkill >= getTotalMaxSkillPointsPerSkill(skill)
    || (totalSkillPoints - spentSkillPoints) === 0) {
    skill.isLocked = true;
  }

  else {
    if (isInvestedInPreviousSkill(skill) && !shouldUberskillBeLocked(skill) &&
      !shouldChallengeSkillsBeLocked(skill) && !isCharacterSpecificLock(skill)) {
      skill.isLocked = false;
    } else {
      skill.isLocked = true;
    }
  }
}
//Tests whether the - button should be locked
function isLockMinusButton(skill) {
  if (skill.spentPointsInSkill === 0) return true;

  if (isInvestedInPreviousSkill(skill) && !shouldUberskillBeLocked(skill) &&
    !shouldChallengeSkillsBeLocked(skill) && !isCharacterSpecificLock(skill)) {
    return false;
  }

  return true;
}

function isInvestedInPreviousSkill(skill) {
  if (skill.previousSkillId === "") return true;

  var previousSkill = getSkillById(skill.previousSkillId)

  if (previousSkill.spentPointsInSkill > 0) return true;
  return false;
}

function getSkillById(id) {
  for (let i = 0; i < skills.length; i++) {
    if (skills[i].id == id) return skills[i];
  }
}

function disableBtnIfSkillLocked(skill, i, isMinusBtnLock) {
  var btn = domSkills[i].getElementsByClassName("btnAddSkill")[0]
  var minusBtn = domSkills[i].getElementsByClassName("btnRemoveSkill")[0]

  btn.disabled = skill.isLocked;
  minusBtn.disabled = isMinusBtnLock;
}

//Updates the DOM elements based on values given below
function updatePointsTexts() {
  document.getElementById("totalPoints").innerHTML = totalSkillPoints;
  document.getElementById("spentPoints").innerHTML = spentSkillPoints;
  document.getElementById("remainingPoints").innerHTML = totalSkillPoints - spentSkillPoints;
  document.getElementById("maxSkillLevel").innerHTML = maxSkills;
}

function shouldUberskillBeLocked(skill) {
  if (skill.id != "2_1" && skill.id != "2_2" && skill.id != "2_3") return false;
  if (skill.spentPointsInSkill > 0) return false;
  if (skill.id === "2_1" && getSkillById("2_2").spentPointsInSkill === 0 && getSkillById("2_3").spentPointsInSkill === 0) {
    return false;
  }
  if (skill.id === "2_2" && getSkillById("2_1").spentPointsInSkill === 0 && getSkillById("2_3").spentPointsInSkill === 0) {
    return false;
  }
  if (skill.id === "2_3" && getSkillById("2_1").spentPointsInSkill === 0 && getSkillById("2_2").spentPointsInSkill === 0) {
    return false;
  }
  return true;
}

function shouldChallengeSkillsBeLocked(skill) {
  if (skill.id === "2_4") {
    return !document.getElementById("ennead").checked;
  } else if (skill.id === "2_5") {
    return !document.getElementById("blackRoad").checked;
  }
  return false;
}

function isCharacterSpecificLock(skill) {
  return isSorcSkillLocked(skill) || isPaladinSkillLocked(skill) || isAmazonSkillLocked(skill);
}

function isSorcSkillLocked(skill) {
  if (currentClass != "sorceress") return false;
  if (skill.id === "3_1" && is2SorcTreesHavePoints("4_1", "5_1", "6_1")) return true;
  if (skill.id === "4_1" && is2SorcTreesHavePoints("3_1", "5_1", "6_1")) return true;
  if (skill.id === "5_1" && is2SorcTreesHavePoints("4_1", "3_1", "6_1")) return true;
  if (skill.id === "6_1" && is2SorcTreesHavePoints("4_1", "5_1", "3_1")) return true;
}

function is2SorcTreesHavePoints(tree1SkillId, tree2SkillId, tree3SkillId) {
  if (getSkillById(tree1SkillId).spentPointsInSkill > 0 && getSkillById(tree2SkillId).spentPointsInSkill > 0 ||
    getSkillById(tree1SkillId).spentPointsInSkill > 0 && getSkillById(tree3SkillId).spentPointsInSkill > 0 ||
    getSkillById(tree2SkillId).spentPointsInSkill > 0 && getSkillById(tree3SkillId).spentPointsInSkill > 0) {
    return true;
  }
  return false;
}

function isPaladinSkillLocked(skill) {
  if (currentClass != "paladin") return false;
  if (isSkillHoly(skill) && isInvestedInUnholySkills()) {
    return true;
  }
  else if (isSkillUnholy(skill) && isInvestedInHolySkills()) {
    return true;
  }
  return false;
}

function isSkillHoly(skill) {
  return skill.id === "2_1" || skill.id === "5_1" || skill.id === "6_1";
}

function isSkillUnholy(skill) {
  return skill.id === "2_2" || skill.id === "3_1" || skill.id === "4_1";
}

function isInvestedInHolySkills() {
  return getSkillById("2_1").spentPointsInSkill > 0 || getSkillById("5_1").spentPointsInSkill > 0 ||
    getSkillById("6_1").spentPointsInSkill > 0;
}

function isInvestedInUnholySkills() {
  return getSkillById("2_2").spentPointsInSkill > 0 || getSkillById("3_1").spentPointsInSkill > 0 ||
    getSkillById("4_1").spentPointsInSkill > 0;
}

function isAmazonSkillLocked(skill) {
  if (currentClass != "amazon") return false;
  if (skill.id === "3_4" && isInvestedInOneOfThreeSkills("4_1", "5_1", "6_1")) return true;
  else if (skill.id === "4_4" && isInvestedInOneOfThreeSkills("3_1", "5_1", "6_1")) return true;
  else if (skill.id === "5_4" && isInvestedInOneOfThreeSkills("4_1", "3_1", "6_1")) return true;
  else if (skill.id === "6_4" && isInvestedInOneOfThreeSkills("4_1", "5_1", "3_1")) return true;
  else if (skill.id === "3_1" && isInvestedInOneOfThreeSkills("4_4", "5_4", "6_4")) return true;
  else if (skill.id === "4_1" && isInvestedInOneOfThreeSkills("3_4", "5_4", "6_4")) return true;
  else if (skill.id === "5_1" && isInvestedInOneOfThreeSkills("4_4", "3_4", "6_4")) return true;
  else if (skill.id === "6_1" && isInvestedInOneOfThreeSkills("4_4", "5_4", "3_4")) return true;

  return false;
}

function isInvestedInOneOfThreeSkills(tree1SkillId, tree2SkillId, tree3SkillId) {
  return getSkillById(tree1SkillId).spentPointsInSkill > 0 ||
    getSkillById(tree2SkillId).spentPointsInSkill > 0 ||
    getSkillById(tree3SkillId).spentPointsInSkill > 0;
}

function addSkill(btn) {
  if (totalSkillPoints - spentSkillPoints === 0) return;

  var txt = btn.parentElement.getElementsByTagName("INPUT")[0]
  txt.value = parseInt(txt.value) + 1;

  getSkillById(btn.parentElement.id).spentPointsInSkill++;
  spentSkillPoints++;

  update();
}

function removeSkillPoint(btn) {
  if (getSkillById(btn.parentElement.id).spentPointsInSkill === 0) return;

  var txt = btn.parentElement.getElementsByTagName("INPUT")[0]
  txt.value = parseInt(txt.value) - 1;

  getSkillById(btn.parentElement.id).spentPointsInSkill--;
  spentSkillPoints--;

  update();
}

function toggleAllCheckboxes(toggle) {
  for (let i = 0; i < domCheckboxes.length; i++) {
    if (domCheckboxes[i].id === "venefica" && currentClass != "sorceress") continue;
    domCheckboxes[i].checked = toggle;
  }
  update();
}

function resetSkills() {
  for (let i = 0; i < domSkills.length; i++) {
    getSkillById(domSkills[i].id).spentPointsInSkill = 0;

    var txt = domSkills[i].getElementsByTagName("INPUT")[0]
    txt.value = 0;
  }
  spentSkillPoints = 0;
  update();
}




var pointRewards = [
  {
    "id": "hDenOfEvil",
    "skillPoints": 1,
    "maxSkillLevels": 0
  },
  {
    "id": "tDenOfEvil",
    "skillPoints": 1,
    "maxSkillLevels": 0
  },
  {
    "id": "dDenOfEvil",
    "skillPoints": 1,
    "maxSkillLevels": 0
  },
  {
    "id": "hRadament",
    "skillPoints": 1,
    "maxSkillLevels": 0
  },
  {
    "id": "tRadament",
    "skillPoints": 1,
    "maxSkillLevels": 0
  },
  {
    "id": "dRadament",
    "skillPoints": 1,
    "maxSkillLevels": 0
  },
  {
    "id": "hIzual",
    "skillPoints": 2,
    "maxSkillLevels": 0
  },
  {
    "id": "tIzual",
    "skillPoints": 2,
    "maxSkillLevels": 0
  },
  {
    "id": "dIzual",
    "skillPoints": 2,
    "maxSkillLevels": 0
  },
  {
    "id": "firstSkillSignet",
    "skillPoints": 1,
    "maxSkillLevels": 0
  },
  {
    "id": "secondSkillSignet",
    "skillPoints": 1,
    "maxSkillLevels": 0
  },
  {
    "id": "thirdSkillSignet",
    "skillPoints": 1,
    "maxSkillLevels": 0
  },
  {
    "id": "ennead",
    "skillPoints": 0,
    "maxSkillLevels": 1
  },
  {
    "id": "blackRoad",
    "skillPoints": 0,
    "maxSkillLevels": 0
  },
  {
    "id": "witchQueen",
    "skillPoints": 0,
    "maxSkillLevels": 1
  },
  {
    "id": "crowned",
    "skillPoints": 0,
    "maxSkillLevels": 1
  },
  {
    "id": "mirrorMirror",
    "skillPoints": 0,
    "maxSkillLevels": 1
  },
  {
    "id": "moonOfTheSpider",
    "skillPoints": 0,
    "maxSkillLevels": 1
  },
  {
    "id": "legacyOfBlood",
    "skillPoints": 0,
    "maxSkillLevels": 2
  },
  {
    "id": "bremmtown",
    "skillPoints": 0,
    "maxSkillLevels": 1
  },
  {
    "id": "toraja",
    "skillPoints": 0,
    "maxSkillLevels": 1
  },
  {
    "id": "drekavac",
    "skillPoints": 0,
    "maxSkillLevels": 1
  },
  {
    "id": "venefica",
    "skillPoints": 0,
    "maxSkillLevels": 1
  }
]

var skills = [
  {
    "id": "1_1",
    "baseMaxPoints": 22,
    "isLocked": false,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": ""
  },
  {
    "id": "1_2",
    "baseMaxPoints": 21,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "1_1"
  },
  {
    "id": "1_3",
    "baseMaxPoints": 20,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "1_2"
  },
  {
    "id": "1_4",
    "baseMaxPoints": 19,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "1_3"
  },
  {
    "id": "1_5",
    "baseMaxPoints": 18,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "1_4"
  },
  {
    "id": "2_1",
    "baseMaxPoints": 7,
    "isLocked": true,
    "special": "uberskill",
    "spentPointsInSkill": 0,
    "previousSkillId": ""
  },
  {
    "id": "2_2",
    "baseMaxPoints": 7,
    "isLocked": true,
    "special": "uberskill",
    "spentPointsInSkill": 0,
    "previousSkillId": ""
  },
  {
    "id": "2_3",
    "baseMaxPoints": 7,
    "isLocked": true,
    "special": "uberskill",
    "spentPointsInSkill": 0,
    "previousSkillId": ""
  },
  {
    "id": "2_4",
    "baseMaxPoints": 7,
    "isLocked": true,
    "special": "ennead",
    "spentPointsInSkill": 0,
    "previousSkillId": ""
  },
  {
    "id": "2_5",
    "baseMaxPoints": 7,
    "isLocked": true,
    "special": "brc",
    "spentPointsInSkill": 0,
    "previousSkillId": ""
  },
  {
    "id": "3_1",
    "baseMaxPoints": 22,
    "isLocked": false,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": ""
  },
  {
    "id": "3_2",
    "baseMaxPoints": 21,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "3_1"
  },
  {
    "id": "3_3",
    "baseMaxPoints": 20,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "3_2"
  },
  {
    "id": "3_4",
    "baseMaxPoints": 19,
    "isLocked": true,
    "special": "lioness",
    "spentPointsInSkill": 0,
    "previousSkillId": "3_3"
  },
  {
    "id": "3_5",
    "baseMaxPoints": 18,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "3_4"
  },
  {
    "id": "4_1",
    "baseMaxPoints": 22,
    "isLocked": false,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": ""
  },
  {
    "id": "4_2",
    "baseMaxPoints": 21,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "4_1"
  },
  {
    "id": "4_3",
    "baseMaxPoints": 20,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "4_2"
  },
  {
    "id": "4_4",
    "baseMaxPoints": 19,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "4_3"
  },
  {
    "id": "4_5",
    "baseMaxPoints": 18,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "4_4"
  },
  {
    "id": "5_1",
    "baseMaxPoints": 22,
    "isLocked": false,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": ""
  },
  {
    "id": "5_2",
    "baseMaxPoints": 21,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "5_1"
  },
  {
    "id": "5_3",
    "baseMaxPoints": 20,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "5_2"
  },
  {
    "id": "5_4",
    "baseMaxPoints": 19,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "5_3"
  },
  {
    "id": "5_5",
    "baseMaxPoints": 18,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "5_4"
  },
  {
    "id": "6_1",
    "baseMaxPoints": 22,
    "isLocked": false,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": ""
  },
  {
    "id": "6_2",
    "baseMaxPoints": 21,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "6_1"
  },
  {
    "id": "6_3",
    "baseMaxPoints": 20,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "6_2"
  },
  {
    "id": "6_4",
    "baseMaxPoints": 19,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "6_3"
  },
  {
    "id": "6_5",
    "baseMaxPoints": 18,
    "isLocked": true,
    "special": "",
    "spentPointsInSkill": 0,
    "previousSkillId": "6_4"
  },
]

window.onload = initialize();

function initialize() {
  domSkills = document.getElementsByClassName("skill");
  disableTextFields();
  update();
}

var amazon = [
  {
    "name": "Wild and Free",
    "imgPath": "../img/skillicons/amazon/WildAndFree.gif",
  },
  {
    "name": "Curare",
    "imgPath": "../img/skillicons/amazon/Curare.gif"
  },
  {
    "name": "Summon Fire Elementals",
    "imgPath": "../img/skillicons/amazon/FireElementals.gif"
  },
  {
    "name": "Paragon",
    "imgPath": "../img/skillicons/amazon/Paragon.gif"
  },
  {
    "name": "Balance",
    "imgPath": "../img/skillicons/amazon/Balance.gif"
  },
  {
    "name": "Spirit of Vengeance",
    "imgPath": "../img/skillicons/amazon/SpiritofVengeance.gif"
  },
  {
    "name": "Ecstatic Frenzy",
    "imgPath": "../img/skillicons/amazon/EcstaticFrenzy.gif"
  },
  {
    "name": "Spellbind",
    "imgPath": "../img/skillicons/amazon/Spellbind.gif"
  },
  {
    "name": "Defensive Harmony",
    "imgPath": "../img/skillicons/amazon/DefensiveHarmony.gif"
  },
  {
    "name": "War Spirit",
    "imgPath": "../img/skillicons/amazon/WarSpirit.gif"
  },
  {
    "name": "Takedown",
    "imgPath": "../img/skillicons/amazon/Takedown.gif"
  },
  {
    "name": "Magic Missiles",
    "imgPath": "../img/skillicons/amazon/MagicMissiles.gif"
  },
  {
    "name": "Prowl",
    "imgPath": "../img/skillicons/amazon/Prowl.gif"
  },
  {
    "name": "Balefire",
    "imgPath": "../img/skillicons/amazon/Balefire.gif"
  },
  {
    "name": "Pounce",
    "imgPath": "../img/skillicons/amazon/Pounce.gif"
  },
  {
    "name": "Bloodstorm",
    "imgPath": "../img/skillicons/amazon/Bloodstorm.gif"
  },
  {
    "name": "Lioness",
    "imgPath": "../img/skillicons/amazon/Lioness.gif"
  },
  {
    "name": "Bacchanalia",
    "imgPath": "../img/skillicons/amazon/Bacchanalia.gif"
  },
  {
    "name": "Great Hunt",
    "imgPath": "../img/skillicons/amazon/GreatHunt.gif"
  },
  {
    "name": "Lava Pit",
    "imgPath": "../img/skillicons/amazon/LavaPit.gif"
  },
  {
    "name": "Ghost Arrow",
    "imgPath": "../img/skillicons/amazon/GhostArrow.gif"
  },
  {
    "name": "Moonbeam",
    "imgPath": "../img/skillicons/amazon/Moonbeam.gif"
  },
  {
    "name": "Barrage",
    "imgPath": "../img/skillicons/amazon/Barrage.gif"
  },
  {
    "name": "Ricochet",
    "imgPath": "../img/skillicons/amazon/Ricochet.gif"
  },
  {
    "name": "Phalanx",
    "imgPath": "../img/skillicons/amazon/Phalanx.gif"
  },
  {
    "name": "Enfilade",
    "imgPath": "../img/skillicons/amazon/Enfilade.gif"
  },
  {
    "name": "Dragonlore",
    "imgPath": "../img/skillicons/amazon/Dragonlore.gif"
  },
  {
    "name": "Moon Queen",
    "imgPath": "../img/skillicons/amazon/MoonQueen.gif"
  },
  {
    "name": "Wyrmshot",
    "imgPath": "../img/skillicons/amazon/Wyrmshot.gif"
  },
  {
    "name": "Fairy Ring",
    "imgPath": "../img/skillicons/amazon/FairyRing.gif"
  }
]

var assassin = [
  {
    "name": "Blink",
    "imgPath": "../img/skillicons/assassin/Blink.gif"
  },
  {
    "name": "Beacon",
    "imgPath": "../img/skillicons/assassin/Beacon.gif"
  },
  {
    "name": "Starburst",
    "imgPath": "../img/skillicons/assassin/Starburst.gif"
  },
  {
    "name": "Way of the Gryphon",
    "imgPath": "../img/skillicons/assassin/WayoftheGryphon.gif"
  },
  {
    "name": "Bionetic Blast",
    "imgPath": "../img/skillicons/assassin/BioneticBlast.gif"
  },
  {
    "name": "Phase Bomb",
    "imgPath": "../img/skillicons/assassin/PhaseBomb.gif"
  },
  {
    "name": "Psionic Storm",
    "imgPath": "../img/skillicons/assassin/PsionicStorm.gif"
  },
  {
    "name": "Vampiric Icon",
    "imgPath": "../img/skillicons/assassin/VampiricIcon.gif"
  },
  {
    "name": "Perfect Being",
    "imgPath": "../img/skillicons/assassin/PerfectBeing.gif"
  },
  {
    "name": "Psychic Scream",
    "imgPath": "../img/skillicons/assassin/PsychicScream.gif"
  },
  {
    "name": "Scorpion Blade",
    "imgPath": "../img/skillicons/assassin/ScorpionBlade.gif"
  },
  {
    "name": "Cluster Mine",
    "imgPath": "../img/skillicons/assassin/ClusterMine.gif"
  },
  {
    "name": "Storm Crows",
    "imgPath": "../img/skillicons/assassin/StormCrows.gif"
  },
  {
    "name": "Cryo Beam",
    "imgPath": "../img/skillicons/assassin/CryoBeam.gif"
  },
  {
    "name": "Wychwind",
    "imgPath": "../img/skillicons/assassin/Wychwind.gif"
  },
  {
    "name": "Electrofield Sentry",
    "imgPath": "../img/skillicons/assassin/ElectrofieldSentry.gif"
  },
  {
    "name": "Maelstrom MK III",
    "imgPath": "../img/skillicons/assassin/Maelstrom3.gif"
  },
  {
    "name": "FireballSentry",
    "imgPath": "../img/skillicons/assassin/FireballSentry.gif"
  },
  {
    "name": "Broadside",
    "imgPath": "../img/skillicons/assassin/Broadside.gif"
  },
  {
    "name": "Singularity",
    "imgPath": "../img/skillicons/assassin/Singularity.gif"
  },
  {
    "name": "Batstrike",
    "imgPath": "../img/skillicons/assassin/Batstrike.gif"
  },
  {
    "name": "Way of the Spider",
    "imgPath": "../img/skillicons/assassin/WayoftheSpider.gif"
  },
  {
    "name": "Crucify",
    "imgPath": "../img/skillicons/assassin/Crucify.gif"
  },
  {
    "name": "Shadow Refuge",
    "imgPath": "../img/skillicons/assassin/ShadowRefuge.gif"
  },
  {
    "name": "Queen of Blades",
    "imgPath": "../img/skillicons/assassin/QueenofBlades.gif"
  },
  {
    "name": "Twin Fang Strike",
    "imgPath": "../img/skillicons/assassin/TwinFangStrike.gif"
  },
  {
    "name": "Barrier Strike",
    "imgPath": "../img/skillicons/assassin/BarrierStrike.gif"
  },
  {
    "name": "Laserblade",
    "imgPath": "../img/skillicons/assassin/Laserblade.gif"
  },
  {
    "name": "Doom",
    "imgPath": "../img/skillicons/assassin/Doom.gif"
  },
  {
    "name": "Way of the Phoenix",
    "imgPath": "../img/skillicons/assassin/WayofthePhoenix.gif"
  }
]

var barbarian = [
  {
    "name": "Wolf Companion",
    "imgPath": "../img/skillicons/barbarian/WolfCompanion.gif"
  },
  {
    "name": "Nephalem Weapons",
    "imgPath": "../img/skillicons/barbarian/NephalemWeapons.gif"
  },
  {
    "name": "Ancient Blood",
    "imgPath": "../img/skillicons/barbarian/AncientBlood.gif"
  },
  {
    "name": "Runemaster",
    "imgPath": "../img/skillicons/barbarian/Runemaster.gif"
  },
  {
    "name": "Fortress",
    "imgPath": "../img/skillicons/barbarian/Fortress.gif"
  },
  {
    "name": "Shamanic Trance",
    "imgPath": "../img/skillicons/barbarian/ShamanicTrance.gif"
  },
  {
    "name": "Spirit Guide",
    "imgPath": "../img/skillicons/barbarian/SpiritGuide.gif"
  },
  {
    "name": "Immortal",
    "imgPath": "../img/skillicons/barbarian/Immortal.gif"
  },
  {
    "name": "Mountain King",
    "imgPath": "../img/skillicons/barbarian/MountainKing.gif"
  },
  {
    "name": "Thundergod",
    "imgPath": "../img/skillicons/barbarian/Thundergod.gif"
  },
  {
    "name": "Guardian Spirit",
    "imgPath": "../img/skillicons/barbarian/GuardianSpirit.gif"
  },
  {
    "name": "Lion Stance",
    "imgPath": "../img/skillicons/barbarian/LionStance.gif"
  },
  {
    "name": "Defender Spirit",
    "imgPath": "../img/skillicons/barbarian/DefenderSpirit.gif"
  },
  {
    "name": "Snake Stance",
    "imgPath": "../img/skillicons/barbarian/SnakeStance.gif"
  },
  {
    "name": "Protector Spirit",
    "imgPath": "../img/skillicons/barbarian/ProtectorSpirit.gif"
  },
  {
    "name": "Bear Stance",
    "imgPath": "../img/skillicons/barbarian/BearStance.gif"
  },
  {
    "name": "Greater Manifestations",
    "imgPath": "../img/skillicons/barbarian/GreaterManifestations.gif"
  },
  {
    "name": "Eagle Stance",
    "imgPath": "../img/skillicons/barbarian/EagleStance.gif"
  },
  {
    "name": "Spirit Walk",
    "imgPath": "../img/skillicons/barbarian/SpiritWalk.gif"
  },
  {
    "name": "Wolf Stance",
    "imgPath": "../img/skillicons/barbarian/WolfStance.gif"
  },
  {
    "name": "Earthquake",
    "imgPath": "../img/skillicons/barbarian/Earthquake.gif"
  },
  {
    "name": "Bear Claw",
    "imgPath": "../img/skillicons/barbarian/BearClaw.gif"
  },
  {
    "name": "Bloodhatred",
    "imgPath": "../img/skillicons/barbarian/Bloodhatred.gif"
  },
  {
    "name": "Stampede",
    "imgPath": "../img/skillicons/barbarian/Stampede.gif"
  },
  {
    "name": "Thunder Slam",
    "imgPath": "../img/skillicons/barbarian/ThunderSlam.gif"
  },
  {
    "name": "Rebound",
    "imgPath": "../img/skillicons/barbarian/Rebound.gif"
  },
  {
    "name": "Shower of Rocks",
    "imgPath": "../img/skillicons/barbarian/ShowerOfRocks.gif"
  },
  {
    "name": "Screaming Eagle",
    "imgPath": "../img/skillicons/barbarian/ScreamingEagle.gif"
  },
  {
    "name": "Stormblast",
    "imgPath": "../img/skillicons/barbarian/Stormblast.gif"
  },
  {
    "name": "Overkill",
    "imgPath": "../img/skillicons/barbarian/Overkill.gif"
  }
]

var druid = [
  {
    "name": "Blindside",
    "imgPath": "../img/skillicons/druid/Blindside.gif"
  },
  {
    "name": "Force of Nature",
    "imgPath": "../img/skillicons/druid/ForceOfNature.gif"
  },
  {
    "name": "Cascade",
    "imgPath": "../img/skillicons/druid/Cascade.gif"
  },
  {
    "name": "Faerie Fire",
    "imgPath": "../img/skillicons/druid/FaerieFire.gif"
  },
  {
    "name": "Spore Shot",
    "imgPath": "../img/skillicons/druid/SporeShot.gif"
  },
  {
    "name": "Tremor",
    "imgPath": "../img/skillicons/druid/Tremor.gif"
  },
  {
    "name": "Elfin Weapons",
    "imgPath": "../img/skillicons/druid/ElfinWeapons.gif"
  },
  {
    "name": "Goodberry",
    "imgPath": "../img/skillicons/druid/Goodberry.gif"
  },
  {
    "name": "Nova Shot",
    "imgPath": "../img/skillicons/druid/NovaShot.gif"
  },
  {
    "name": "Lifeshield",
    "imgPath": "../img/skillicons/druid/Lifeshield.gif"
  },
  {
    "name": "Elemental",
    "imgPath": "../img/skillicons/druid/Elemental.gif"
  },
  {
    "name": "Poison Flash",
    "imgPath": "../img/skillicons/druid/PoisonFlash.gif"
  },
  {
    "name": "Hunting Banshee",
    "imgPath": "../img/skillicons/druid/HuntingBanshee.gif"
  },
  {
    "name": "Elvensong",
    "imgPath": "../img/skillicons/druid/Elvensong.gif"
  },
  {
    "name": "Pagan Rites",
    "imgPath": "../img/skillicons/druid/PaganRites.gif"
  },
  {
    "name": "Plague Avatar",
    "imgPath": "../img/skillicons/druid/PlagueAvatar.gif"
  },
  {
    "name": "Rain of Fire",
    "imgPath": "../img/skillicons/druid/RainOfFire.gif"
  },
  {
    "name": "Mythal",
    "imgPath": "../img/skillicons/druid/Mythal.gif"
  },
  {
    "name": "Freezing Gale",
    "imgPath": "../img/skillicons/druid/FreezingGale.gif"
  },
  {
    "name": "Summon Acid Fiends",
    "imgPath": "../img/skillicons/druid/SummonAcidFiends.gif"
  },
  {
    "name": "Treewarden Form",
    "imgPath": "../img/skillicons/druid/TreewardenForm.gif"
  },
  {
    "name": "Trap Rat Form",
    "imgPath": "../img/skillicons/druid/TrapRatForm.gif"
  },
  {
    "name": "Pummel",
    "imgPath": "../img/skillicons/druid/Pummel.gif"
  },
  {
    "name": "Quill Storm",
    "imgPath": "../img/skillicons/druid/QuillStorm.gif"
  },
  {
    "name": "Circle of Life",
    "imgPath": "../img/skillicons/druid/CircleOfLife.gif"
  },
  {
    "name": "Egg Trap",
    "imgPath": "../img/skillicons/druid/EggTrap.gif"
  },
  {
    "name": "Wildfire",
    "imgPath": "../img/skillicons/druid/Wildfire.gif"
  },
  {
    "name": "Ferocity",
    "imgPath": "../img/skillicons/druid/Ferocity.gif"
  },
  {
    "name": "Idol of Scosglen",
    "imgPath": "../img/skillicons/druid/IdolOfScosglen.gif"
  },
  {
    "name": "Thorn Wall",
    "imgPath": "../img/skillicons/druid/ThornWall.gif"
  }
]

var necromancer = [
  {
    "name": "Summon Shadows",
    "imgPath": "../img/skillicons/necromancer/SummonShadows.gif"
  },
  {
    "name": "Summon Jinn",
    "imgPath": "../img/skillicons/necromancer/SummonJinn.gif"
  },
  {
    "name": "Summon Rampagor",
    "imgPath": "../img/skillicons/necromancer/SummonRampagor.gif"
  },
  {
    "name": "Rathma's Chosen",
    "imgPath": "../img/skillicons/necromancer/RathmasChosen.gif"
  },
  {
    "name": "Summon Lamia",
    "imgPath": "../img/skillicons/necromancer/SummonLamia.gif"
  },
  {
    "name": "Death Ward",
    "imgPath": "../img/skillicons/necromancer/DeathWard.gif"
  },
  {
    "name": "Summon Veil King",
    "imgPath": "../img/skillicons/necromancer/SummonVeilKing.gif"
  },
  {
    "name": "Black Mass",
    "imgPath": "../img/skillicons/necromancer/BlackMass.gif"
  },
  {
    "name": "Summon Void Archon",
    "imgPath": "../img/skillicons/necromancer/SummonVoidArchon.gif"
  },
  {
    "name": "Graveyard",
    "imgPath": "../img/skillicons/necromancer/Graveyard.gif"
  },
  {
    "name": "Massacre",
    "imgPath": "../img/skillicons/necromancer/Massacre.gif"
  },
  {
    "name": "Buckshot",
    "imgPath": "../img/skillicons/necromancer/Buckshot.gif"
  },
  {
    "name": "Angel of Death",
    "imgPath": "../img/skillicons/necromancer/AngelOfDeath.gif"
  },
  {
    "name": "Flametail Shot",
    "imgPath": "../img/skillicons/necromancer/FlametailShot.gif"
  },
  {
    "name": "Famine",
    "imgPath": "../img/skillicons/necromancer/Famine.gif"
  },
  {
    "name": "Dragonfire Oil",
    "imgPath": "../img/skillicons/necromancer/DragonfireOil.gif"
  },
  {
    "name": "Parasite",
    "imgPath": "../img/skillicons/necromancer/Parasite.gif"
  },
  {
    "name": "Fragmentation Shot",
    "imgPath": "../img/skillicons/necromancer/FragmentationShot.gif"
  },
  {
    "name": "Deathlord",
    "imgPath": "../img/skillicons/necromancer/Deathlord.gif"
  },
  {
    "name": "Widowmaker",
    "imgPath": "../img/skillicons/necromancer/Widowmaker.gif"
  },
  {
    "name": "Death's Fury Totem",
    "imgPath": "../img/skillicons/necromancer/DeathsFuryTotem.gif"
  },
  {
    "name": "Embalming",
    "imgPath": "../img/skillicons/necromancer/Embalming.gif"
  },
  {
    "name": "Frostclaw Totem",
    "imgPath": "../img/skillicons/necromancer/FrostclawTotem.gif"
  },
  {
    "name": "Sacrifices",
    "imgPath": "../img/skillicons/necromancer/Sacrifices.gif"
  },
  {
    "name": "Fireheart Totem",
    "imgPath": "../img/skillicons/necromancer/FireheartTotem.gif"
  },
  {
    "name": "Bend the Shadows",
    "imgPath": "../img/skillicons/necromancer/BendTheShadows.gif"
  },
  {
    "name": "Howling Totem",
    "imgPath": "../img/skillicons/necromancer/HowlingTotem.gif"
  },
  {
    "name": "Bane",
    "imgPath": "../img/skillicons/necromancer/Bane.gif"
  },
  {
    "name": "Stormeye Totem",
    "imgPath": "../img/skillicons/necromancer/StormeyeTotem.gif"
  },
  {
    "name": "Talon's Hold",
    "imgPath": "../img/skillicons/necromancer/TalonsHold.gif"
  }
]

var paladin = [
  {
    "name": "Vessel of Judgement",
    "imgPath": "../img/skillicons/paladin/Judgement.gif"
  },
  {
    "name": "Resurrect",
    "imgPath": "../img/skillicons/paladin/Resurrect.gif"
  },
  {
    "name": "Rapture",
    "imgPath": "../img/skillicons/paladin/Rapture.gif"
  },
  {
    "name": "Superbeast",
    "imgPath": "../img/skillicons/paladin/Superbeast.gif"
  },
  {
    "name": "Light and Shadow",
    "imgPath": "../img/skillicons/paladin/LightAndShadow.gif"
  },
  {
    "name": "Plague",
    "imgPath": "../img/skillicons/paladin/Plague.gif"
  },
  {
    "name": "Sacred Armor",
    "imgPath": "../img/skillicons/paladin/SacredArmor.gif"
  },
  {
    "name": "Divine Apparition",
    "imgPath": "../img/skillicons/paladin/DivineApparition.gif"
  },
  {
    "name": "Scourge",
    "imgPath": "../img/skillicons/paladin/Scourge.gif"
  },
  {
    "name": "Blessed Life",
    "imgPath": "../img/skillicons/paladin/BlessedLife.gif"
  },
  {
    "name": "Terror Strike",
    "imgPath": "../img/skillicons/paladin/TerrorStrike.gif"
  },
  {
    "name": "Tainted Blood",
    "imgPath": "../img/skillicons/paladin/TaintedBlood.gif"
  },
  {
    "name": "Lemures",
    "imgPath": "../img/skillicons/paladin/Lemures.gif"
  },
  {
    "name": "Mind Flay",
    "imgPath": "../img/skillicons/paladin/MindFlay.gif"
  },
  {
    "name": "Black Sleep",
    "imgPath": "../img/skillicons/paladin/BlackSleep.gif"
  },
  {
    "name": "Symphony of Destruction",
    "imgPath": "../img/skillicons/paladin/SymphonyOfDestruction.gif"
  },
  {
    "name": "Blood Thorns",
    "imgPath": "../img/skillicons/paladin/BloodThorns.gif"
  },
  {
    "name": "Slayer",
    "imgPath": "../img/skillicons/paladin/Slayer.gif"
  },
  {
    "name": "Hymn",
    "imgPath": "../img/skillicons/paladin/Hymn.gif"
  },
  {
    "name": "Stormlord",
    "imgPath": "../img/skillicons/paladin/Stormlord.gif"
  },
  {
    "name": "Retaliate",
    "imgPath": "../img/skillicons/paladin/Retaliate.gif"
  },
  {
    "name": "Searing Glow",
    "imgPath": "../img/skillicons/paladin/SearingGlow.gif"
  },
  {
    "name": "Hammerstrike",
    "imgPath": "../img/skillicons/paladin/Hammerstrike.gif"
  },
  {
    "name": "Ring of Light",
    "imgPath": "../img/skillicons/paladin/RingOfLight.gif"
  },
  {
    "name": "Merkabah",
    "imgPath": "../img/skillicons/paladin/Merkabah.gif"
  },
  {
    "name": "Brimstone",
    "imgPath": "../img/skillicons/paladin/Brimstone.gif"
  },
  {
    "name": "Lionheart",
    "imgPath": "../img/skillicons/paladin/Lionheart.gif"
  },
  {
    "name": "Glittering Regalia",
    "imgPath": "../img/skillicons/paladin/GlitteringRegalia.gif"
  },
  {
    "name": "Colosseum",
    "imgPath": "../img/skillicons/paladin/Colosseum.gif"
  },
  {
    "name": "Rising Dawn",
    "imgPath": "../img/skillicons/paladin/RisingDawn.gif"
  }
]

var sorceress = [
  {
    "name": "Moonstrike",
    "imgPath": "../img/skillicons/sorceress/Moonstrike.gif"
  },
  {
    "name": "Chronofield",
    "imgPath": "../img/skillicons/sorceress/Chronofield.gif"
  },
  {
    "name": "Familiar",
    "imgPath": "../img/skillicons/sorceress/Familiar.gif"
  },
  {
    "name": "Witch Blood",
    "imgPath": "../img/skillicons/sorceress/WitchBlood.gif"
  },
  {
    "name": "Arcane Torrent",
    "imgPath": "../img/skillicons/sorceress/ArcaneTorrent.gif"
  },
  {
    "name": "Baneblade",
    "imgPath": "../img/skillicons/sorceress/Baneblade.gif"
  },
  {
    "name": "Mana Sweep",
    "imgPath": "../img/skillicons/sorceress/ManaSweep.gif"
  },
  {
    "name": "Symbol of Esu",
    "imgPath": "../img/skillicons/sorceress/SymbolOfEsu.gif"
  },
  {
    "name": "Bladestorm",
    "imgPath": "../img/skillicons/sorceress/Bladestorm.gif"
  },
  {
    "name": "Arcane Fury",
    "imgPath": "../img/skillicons/sorceress/ArcaneFury.gif"
  },
  {
    "name": "Forked Lightning",
    "imgPath": "../img/skillicons/sorceress/ForkedLightning.gif"
  },
  {
    "name": "Lorenado",
    "imgPath": "../img/skillicons/sorceress/Lorenado.gif"
  },
  {
    "name": "Thunderstone",
    "imgPath": "../img/skillicons/sorceress/Thunderstone.gif"
  },
  {
    "name": "Vengeful Power",
    "imgPath": "../img/skillicons/sorceress/VengefulPower.gif"
  },
  {
    "name": "Tempest",
    "imgPath": "../img/skillicons/sorceress/Tempest.gif"
  },
  {
    "name": "Miasma",
    "imgPath": "../img/skillicons/sorceress/Miasma.gif"
  },
  {
    "name": "Warp Armor",
    "imgPath": "../img/skillicons/sorceress/WarpArmor.gif"
  },
  {
    "name": "Carpet of Spiders",
    "imgPath": "../img/skillicons/sorceress/CarpetOfSpiders.gif"
  },
  {
    "name": "Nova Charge",
    "imgPath": "../img/skillicons/sorceress/NovaCharge.gif"
  },
  {
    "name": "Hive",
    "imgPath": "../img/skillicons/sorceress/Hive.gif"
  },
  {
    "name": "Flamefront",
    "imgPath": "../img/skillicons/sorceress/Flamefront.gif"
  },
  {
    "name": "Shatter the Flesh",
    "imgPath": "../img/skillicons/sorceress/ShatterTheFlesh.gif"
  },
  {
    "name": "Living Flame",
    "imgPath": "../img/skillicons/sorceress/LivingFlame.gif"
  },
  {
    "name": "Frigid Sphere",
    "imgPath": "../img/skillicons/sorceress/FrigidSphere.gif"
  },
  {
    "name": "Flamestrike",
    "imgPath": "../img/skillicons/sorceress/Flamestrike.gif"
  },
  {
    "name": "Snow Queen",
    "imgPath": "../img/skillicons/sorceress/SnowQueen.gif"
  },
  {
    "name": "Pyroblast",
    "imgPath": "../img/skillicons/sorceress/Pyroblast.gif"
  },
  {
    "name": "Abyss",
    "imgPath": "../img/skillicons/sorceress/Abyss.gif"
  },
  {
    "name": "Firedance",
    "imgPath": "../img/skillicons/sorceress/Firedance.gif"
  },
  {
    "name": "Summon Ice Elementals",
    "imgPath": "../img/skillicons/sorceress/SummonIceElementals.gif"
  }
]