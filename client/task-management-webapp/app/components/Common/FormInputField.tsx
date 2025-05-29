import type { ChangeEvent, ReactNode } from "react";

type Props = {
	name: string;
	placeHolder: string;
	property: any;
	children: ReactNode;
	autoFocus?: any;
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const FormInputField = ({
	name,
	placeHolder,
	property,
	children,
	autoFocus,
	handleChange,
}: Props) => {
	return (
		<div>
			<label
				htmlFor={name}
				className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
			>
				{children}
			</label>
			<input
				id={name}
				name={name}
				type="text"
				value={property}
				onChange={handleChange}
				className="placeholder-white/50 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
				placeholder={placeHolder}
				autoFocus={autoFocus !== null}
				required
			/>
		</div>
	);
};

export default FormInputField;
