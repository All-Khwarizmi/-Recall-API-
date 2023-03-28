import { number, z } from "zod";

type CountingSort = [["key"], 1 | 2 | 3 | 4 | 5];
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
  const len: number = arr.length;
  while (i < len) {
    countingArr[arr[i][1]]++;

    i++;
  }

  // Step 2: we calculate how many elements exist in the input array `A` which are less than or equals for the given index
  let indexB = 1;
  const lenB = countingArr.length;
  while (indexB <= lenB) {
    countingArr[indexB] += countingArr[indexB - 1]!;

    indexB++;
  }

  // Step 3 : Sorting the initial array into the end array by looping over the first one, taking the value as index of the counting array which gives the index into the end array where we copy the content of the initial array current index
  let indexC = 0;
  while (indexC < len) {
    arrB[countingArr[arr[indexC][1]]!] = arr[indexC];

    indexC++;
  }

  return arrB
};

const arr = [
  ["card1", 2],
  ["card2", 4],
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
