// simulate getting products from DataBase
const products = [
  {id:0, name: "Apples", country: "Italy", cost: 3, instock: 10, sprite:{name: "https://cdn.pixabay.com/photo/2014/02/01/17/30/apple-256268_960_720.jpg"} },
  {id:1, name: "Oranges", country: "Spain", cost: 4, instock: 3, sprite:{name: "https://cdn.pixabay.com/photo/2016/10/07/14/11/tangerines-1721633_960_720.jpg" }},
  {id:2, name: "Beans", country: "USA", cost: 2, instock: 5, sprite:{name: "https://cdn.pixabay.com/photo/2018/09/25/20/09/bush-beans-3702999_960_720.jpg" }},
  {id:3, name: "Cabbage", country: "USA", cost: 1, instock: 8, sprite: {name: "https://cdn.pixabay.com/photo/2018/10/03/21/57/cabbage-3722498_960_720.jpg"} },
];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button} = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  
  useEffect(() => {
   
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const myStyle={
    color:"blue",
    fontSize:"2em"
  }
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [zeroInCart, setZeroInCart] = React.useState(true);
  const [totalSpent, setTotalSpent] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/products",
    {
      data: [],
    }
  );

  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    item[0].instock -= 1;
    // console.log("item:",item)
    // console.log(`add to Cart ${JSON.stringify(item)}`);
    // console.log(name, e.target.id)
    // console.log("id of clicked", e.target.id)
    // console.log("total items",items)
    setCart([...cart, ...item]);
    setZeroInCart(false);
    doFetch(query);
  };
  const deleteCartItem = (delIndex) => {
    let newCart = cart.filter((item, i) => delIndex != i);
    let target = cart.filter((item, index) => delIndex == index)
    let newItems = items.map((item, index) => {
      if(item.name == target[0].name) item.instock += 1;
      return item;
    });
    setCart(newCart);
    setItems(newItems);
  };
  

  let list = items.map((item, index) => {
   let valid = false
    if(items[index].instock <= 0){
     valid=true;
    } ;
console.log(item.sprite.name)
    return (
     
      <li key={index}>
        <Image src={item.sprite.name} width={100} roundedCircle></Image>
        <Button onClick={addToCart} disabled={valid} name={item.name} id={item.id}variant="primary" size="large">
          {item.name}<br/>Price:${item.cost}<br/>Quantity in stock:{item.instock}
        </Button>
      </li>
    );
  }
  );
   let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            {item.name}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          eventKey={1 + index}
        >
          <Card.Body>
            {`Country of Origin: ${item.country}`} <Button onClick={() => deleteCartItem(index)}>Delete from cart</Button>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(newTotal)
    return newTotal;
  };
 
 
  const restockProducts = (url) => {
    doFetch(url);
    let newItems = data.map((item) => {
      let {id, name,country,cost,instock, sprite} = item;
      return {id, name,country,cost,instock, sprite};
    });
    setItems([...items, ...newItems]);
  };

  
  const emptyCart = () => {
    setTotalSpent(totalSpent + finalList().total);
    setCart([])
    setZeroInCart(true);
  }
  

  return (
    <Container>
      <Row>
        <Col>
          <h1>Available Products</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Your Cart</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button disabled={zeroInCart} onClick={emptyCart}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final}</div>
        </Col>
        <Col>
        <div style={myStyle}>Total spent on groceries:${totalSpent}</div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:1337/${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button type="submit">Get New Products</Button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
