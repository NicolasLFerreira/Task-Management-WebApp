type Props = {
	content: string
	size?: string
	id?: string // Added this line for accessibility (e.g., aria-labelledby)
  }
  
  const FormTitle = ({ content, size, id }: Props) => {
	return (
	  <h2
		id={id} // Use the id prop here
		className={`${size ?? "text-xl"} font-bold text-gray-800 dark:text-white`}
	  >
		{content}
	  </h2>
	)
  }
  
  export default FormTitle
  