export interface PerQuestionAnswer {
	question: string;
	element: string[];
}

export default interface IAnswer {
	qcm_id: number;
	answers: PerQuestionAnswer[];
	version: string;
}
