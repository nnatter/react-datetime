import * as React from 'react'
import mergeStyles from '../../../../../utils/mergeStyles';
import { CodeProblem } from './ProblemsTab';
import styles from './_ProblemsPanel.module.css';

interface ProblemsPanelProps {
	id: string
	active: boolean
	onClick: (id: string) => void
	problems: CodeProblem[]
}

export default class ProblemsPanel extends React.Component<ProblemsPanelProps> {
	
	render() {
		const problems = this.renderProblems();

		if( !problems.length ){
			return this.renderNoProblem();
		}

		return (
			<div className={styles.container}>
				<table>
					<tbody>
						{ problems }
					</tbody>
				</table>
			</div>
		);
	}

	renderNoProblem() {
		return (
			<div className={styles.container}>
				Everything ok!
			</div>
		);
	}

	renderProblems() {
		let problems: any[] = [];

		this.props.problems.forEach( (problem:CodeProblem) => {
			if( problem.severity < 4 ) return;

			problems.push(
				this._renderProblem(problem)
			);
		});

		return problems;
	}

	_renderProblem = (problem: CodeProblem) => {
		const cn = mergeStyles(
			styles.lineNumber,
			problem.severity < 7 ? styles.warn : styles.error
		);

		return (
			<tr className={styles.row}>
				<td className={cn}>
					<button className={styles.lineNumberButton}>
						L{problem.startLineNumber}:{problem.startColumn}
					</button>
				</td>
				<td>
					<span>{problem.message}</span>
				</td>
			</tr>
		);
	}
}
