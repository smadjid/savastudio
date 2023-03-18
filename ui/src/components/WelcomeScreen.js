import { Container } from "react-bootstrap"
import Auth from "./Auth"
import "./WelcomeScreen.css"
const WelcomeScreen = (props) =>{
    return (<Container fluid className="align-middle">
    
        <img className='img-fluid center-block' src={process.env.PUBLIC_URL + '/eye.png'} alt="logo" /> 
     
        <br/>
        <h1 className='welcome__msg shimmer '>Welcome to <b>SAVAStudio</b> </h1>
        <br />       
       
        <Auth setView={props.setView} />
        
        </Container>)
}

export default WelcomeScreen