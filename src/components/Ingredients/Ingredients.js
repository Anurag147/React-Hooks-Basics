import React,{useState,useEffect,useCallback,useReducer} from 'react';
import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';

const ingredientReducer = (currentIngredients, action) => {
  switch(action.type){
    case 'ADD':
      return [...currentIngredients, action.ingredient]
    case 'SET':
      return action.ingredients;
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id)
    default:
      throw new Error('This should not be reached');
  }
}

const httpReducer = (prvHttpState, action) => {
  switch(action.type){
    case 'SEND':
      return {loading:true,error:null}
    case 'RESPONSE':
      return {loading:false,error:null};
    case 'ERROR':
      return {loading:false,error:action.errorMessage};
    default:
        throw new Error('This should not be reached');
  }
}
function Ingredients() {

  //Use reducer for managing the state
  const [useringredients,dispatch] = useReducer(ingredientReducer,[]); //[] is the initial state which is empty array
  const [httpState,dispatchHttp] = useReducer(httpReducer,{loading:false,error:null}); //Set initial state

  //const [useringredients,setUserIngredients]=useState([]); // State with input type as array
  //const [isLoading,setIsLoading]=useState(false); // State with input type as booelan
  //const [error,setError]=useState(); // State with input type as null

  useEffect(()=>{
    fetch('https://react-hooks-update-7e305.firebaseio.com/ingredients.json')
    .then(response=>{
      return response.json()
    })
    .then(responseData => {
      const loadedIngredients = [];
      for(const key in responseData){
        loadedIngredients.push({
          id:key,
          title:responseData[key].title,
          amount:responseData[key].amount
        });
      }
      dispatch({type:'SET', ingredients:loadedIngredients});
    })
  },[]); //adding empty array as second argument will ensure this runs only once

  const addIngredientHandler = (ingredient) => {
    dispatchHttp({type:'SEND'});
    fetch('https://react-hooks-update-7e305.firebaseio.com/ingredients.json',{
      method:'POST',
      body:JSON.stringify(ingredient),
      headers: {'Content-Type':'application/json'}
    })
    .then(response => {
      return response.json()
    })
    .then(responseData => {
      dispatchHttp({type:'RESPONSE'});
      //setIsLoading(false);
      /*setUserIngredients(prvIngredients => [...prvIngredients, {
        id: responseData.name,
      ...ingredient}]);*/
      dispatch({type:'ADD', ingredient: {id:responseData.name , ...ingredient}});
    });
  }

  const removeIngredientHandler = useCallback((ingredientId) => {
    dispatchHttp({type:'SEND'});
    fetch(`https://react-hooks-update-7e305.firebaseio.com/ingredients/${ingredientId}.json`,
    {
      method: 'DELETE'
    })
    .then(respone=>{
      dispatchHttp({type:'RESPONSE'});
      /*setUserIngredients(prvIngredients => 
        prvIngredients.filter(ingredient => ingredient.id !== ingredientId));*/
        dispatch({type:'DELETE', id: ingredientId});
    })
    .catch(err=>{
      dispatchHttp({type:'ERROR',errorMessage:err.message});
    })
  },[]);

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    //setUserIngredients(filteredIngredients);
    dispatch({type:'SET', ingredients:filteredIngredients});
  },[]);

  const clearError = () => {
    dispatchHttp({type:'ERROR',errorMessage:null});
  }
  return (
    <div className="App">
      {httpState.error?<ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>:null}
      <IngredientForm onAddIngredient = {addIngredientHandler} loading = {httpState.loading}/>
      <section>
        <Search OnLoadIngredients = {filteredIngredientsHandler}/>
        <IngredientList ingredients = {useringredients} onRemoveItem = {removeIngredientHandler}/>
      </section>
    </div>
  );
}

export default Ingredients;
