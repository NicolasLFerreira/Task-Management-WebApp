type Props = {
	name: string;
	children: React.ReactNode;
};

const FormInputName = ({ name, children }: Props) => {
	return (
		<label
			htmlFor={name}
			className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
		>
			{children}
		</label>
	);
};

export default FormInputName;
