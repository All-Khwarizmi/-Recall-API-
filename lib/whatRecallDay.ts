import { Calendar } from "./helpers";
import differenceInDays from "date-fns/differenceInDays";

type Status = "study" | "late" | "ok";
/* *
 * Takes next recall date and compares it with today's date
 * If diference > 0 = time from recall (ok) & If diference < 1 = time from recall (ok)
 * if diference < 0 = user is late (red)
 *
 */
export const whatRecallDay = (
  lastRecall: string,
  nextRecall: string,
  nextRecallName: string,
  calendar: Calendar
) => {
  let status: Status = "ok";
  let calendarMap = new Map(Object.entries(calendar));

  // Calculate the difence in days
  const diference = differenceInDays(new Date(nextRecall), new Date());

  // Setting possibilities
  if (diference > 1) return (status = "ok");
  if (diference > 0 && diference <= 1) return (status = "study");
  return (status = "late");
};

export type GetNextRecallDay = (recallDay: string) => string;
export const getNextRecallDay: GetNextRecallDay = (recallDay) => {
  if (recallDay === "recallTen") {
    return "recallTen";
  } else {
    const recallDays = [
      "recallOne",
      "recallTwo",
      "recallThree",
      "recallFour",
      "recallSix",
      "recallSeven",
      "recallEight",
      "recallNine",
      "recallTen",
    ];
    const indexOfRecallDay = recallDays.indexOf(recallDay);
    const nextRecallD = recallDays[indexOfRecallDay + 1];
    if (nextRecallD === undefined) {
      return "No recall name";
    } else {
      return nextRecallD;
    }
  }
};
