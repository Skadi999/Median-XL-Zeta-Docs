function calculateSpellDamage() {
  var energy = parseInt(document.getElementById('energy').value);
  var energyFactor = parseInt(document.getElementById('efactor').value);
  var result = 260 * energy / (250 + energy) + Math.min((energy * energyFactor / 15000), 200);
  document.getElementById('result').innerHTML = 'Your spell damage increase is: ' + result.toFixed(2);
}