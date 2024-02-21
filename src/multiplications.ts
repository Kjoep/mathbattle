import { QuestionSet } from "@/game";

export function multiplications(x: number): QuestionSet {
    return new QuestionSet([0,1,2,3,4,5,6,7,8,9,10].map((n) => ({ question: `${n} x ${x}`, correctAnswer: `${n * x}` })))
}

export function divisions(x: number): QuestionSet {
    return new QuestionSet([0,1,2,3,4,5,6,7,8,9,10].map((n) => ({ question: `${n * x} : ${x}`, correctAnswer: `${n}` })))
}