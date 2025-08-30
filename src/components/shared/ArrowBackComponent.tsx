import {ArrowLeftIcon} from "@heroicons/react/24/outline";
import {useNavigate} from "react-router-dom";

interface ArrowBackProps {
    url: string;
}
/**
 * @constant ArrowBackComponent
 * @description Componente de "felchita para ir atras"
 * @param {ArrowBackProps} props - Propiedades del componente
 * @param {string} props.url - URL a la que redirigir al hacer click
 * @returns {JSX.Element} - Elemento JSX que representa el componente
*/
const ArrowBackComponent = (props: ArrowBackProps): JSX.Element => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(props.url)}
            className="mr-4 text-gray-500 hover:text-gray-700"
        >
            <ArrowLeftIcon className="h-6 w-6" />
        </button>
    )
}
export default ArrowBackComponent;