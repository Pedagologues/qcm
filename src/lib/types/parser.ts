export interface IQCMSection {
	type: 'text' | 'question';
	title: string;
	numbering: number;
	raw: string;
}

export interface IQCMTextSection extends IQCMSection {
	type: 'text';
}

export interface IQCMQuestionSection extends IQCMSection {
	type: 'question';
	header: string;
	questions: {
		answer: boolean;
		raw: string;
	}[];
}

export interface IQCMDocument {
	raw: string;
	sections: IQCMSection[];
}
