import React,{useState,useEffect,useRef} from 'react';
import Card from '../UI/Card';
import './Search.css';

const Search = (props) =>  {

  //Array destructuring
  const [enteredFilter,setEnteredFilter]=useState('');

  //Object destructuring
  const {OnLoadIngredients} = props;

  const inputRef=useRef();
  useEffect(()=>{
    const timer = setTimeout(()=>{
      if(enteredFilter===inputRef.current.value){
        const query= enteredFilter.length==0 ? '' : `?orderBy="title"&equalTo="${enteredFilter}"`; //Query to get filtered data 
        fetch('https://react-hooks-update-7e305.firebaseio.com/ingredients.json' + query)
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
          OnLoadIngredients(loadedIngredients);
        });
      }
      },1000); 
      //Call filter not on every key stroke but after 1000 miliseconds and only if enteredFilter is changes
      //Cleanup using use effect
      return ()=> {
        clearTimeout(timer);
      }
  },[enteredFilter,OnLoadIngredients,inputRef]); 
  //This use effect will execute whenever entered filter is changed or OnLoadIngredients method is changed

  return (
    <section className="search">
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          <input ref={inputRef} type="text" value={enteredFilter} 
          onChange={(event)=>{setEnteredFilter(event.target.value)}}/>
        </div>
      </Card>
    </section>
  );
}; 

export default Search;
