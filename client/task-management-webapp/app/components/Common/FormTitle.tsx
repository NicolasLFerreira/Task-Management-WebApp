type Props = {
	content: string;
	size?: string;
};

const FormTitle = ({ content, size }: Props) => {
	return (
		<h2
			className={`${size ?? "text-xl"} font-bold text-gray-800 dark:text-white`}
		>
			{content}
		</h2>
	);
};

export default FormTitle;
