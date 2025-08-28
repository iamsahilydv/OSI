const StageProgressCalculator = async (numPeople) => {
  const stageThresholds = [500, 1500, 6500, 16500, 36500];
  // const stageThresholds = [1, 2, 10, 16500, 36500];
  let currentStage = -1;
  const totalPeople = numPeople;
  // if (totalPeople < 2) {
  //   currentStage = -1;
  //   return currentStage;
  // } else
  if (numPeople < 500) {
    currentStage = 0; // Between 2 (inclusive) and 12 (exclusive)
    return currentStage;
  }
  while (totalPeople >= stageThresholds[currentStage + 1]) {
    console.log("here");
    currentStage++;
    if (currentStage === stageThresholds.length) {
      console.log("Congratulations! You've reached the top stage.");
      return "top";
    }
  }
  return currentStage;
};

module.exports = StageProgressCalculator;
