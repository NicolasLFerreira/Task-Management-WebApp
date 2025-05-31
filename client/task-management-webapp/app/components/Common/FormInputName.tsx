import type { ReactNode } from "react";

type Props = {
	name: string;
	children: ReactNode;
	extraStyle?: string;
};

const FormInputName = ({ name, children, extraStyle }: Props) => {
	return (
		<label
			htmlFor={name}
			className={`flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${extraStyle ?? ""}`}
		>
			{children}
		</label>
	);
};

export default FormInputName;
