export const countingSort = (arr: any) => {
  // Setting counting arr
  let countingArr = [0, 0, 0, 0, 0];

  // Sorted array first initialized with 0 to the length of the initial array
  let arrB = [];
  arrB = arr.map((item: any) => {
    return arrB.push([]);
  });

  // Step 1:  Looping over the new array and counting how many entries by index of counting array
  let i = 0;
  const len = arr.length;
  while (i < len) {
    countingArr[arr[i][1] === 0 ? 0 : arr[i][1] - 1]++;
    // console.log('countingArr in Loop 1', countingArr);

    i++;
  }
  console.log("countingArr end Loop 1", countingArr);
  // Step 2: we calculate how many elements exist in the input array `A` which are less than or equals for the given index
  let indexB = 1;
  const lenB = countingArr.length;
  while (indexB <= lenB - 1) {
    countingArr[indexB] += countingArr[indexB - 1]!;
    // console.log('countingArr in Loop 2', countingArr);

    indexB++;
  }
  console.log("countingArr end Loop 2", countingArr);
  console.log("Arr", arr);
  console.log("arrB", arrB);
  // Step 3 : Sorting the initial array into the end array by looping over the first one, taking the value as index of the counting array which gives the index into the end array where we copy the content of the initial array current index
  let indexC = 0;
  while (indexC < len) {
    arrB[countingArr[arr[indexC][1] === 0 ? 0 : arr[indexC][1] - 1]!] =
      arr[indexC];
    countingArr[arr[indexC][1] === 0 ? 0 : arr[indexC][1] - 1]--;
    // console.log('Arr', arr);
    console.log("countingArr in Loop 3", countingArr);
    console.log("arrB", arrB);

    indexC++;
  }
  arrB.shift();
  return arrB;
};

const arr = [
  ["card1", 2],
  ["card2", 4],
  ["card10", 2],
  ["card9", 4],
  ["card8", 5],
  ["card7", 3],
  ["card3", 2],
  ["card4", 5],
  ["card5", 3],
  ["card6", 2],
];

const sortedArrA = [
  ["card1", 2],
  ["card6", 2],
  ["card5", 3],
  ["card2", 4],
  ["card4", 5],
];
const sortedArrB = [
  ["card6", 2],
  ["card1", 2],
  ["card5", 3],
  ["card2", 4],
  ["card4", 5],
];
console.log(countingSort(arr));
