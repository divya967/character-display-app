import './App.css';
import { Fragment, useEffect, useState } from 'react';

function App() {
  const [characterResults, setCharacterResuts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const goToNextPage = () => {
    setCurrentPage((page) => page + 1);
  }

  const goToPreviousPage = () => {
    setCurrentPage((page) => page - 1);
  }

  const changePage = (event) => {
    const pageNumber = Number(event.target.textContent);
    setCurrentPage(pageNumber);
  }

  const getLocationAndOriginDetails = async (results) => {
    const characterResults = [...results];
    characterResults.forEach(async character => {
      if(character.location) {
        const locationDetailsResponse = await fetch(character.location.url);
        const locationDetails = await locationDetailsResponse.json();
        const locationObj = {
          'dimension': locationDetails.dimension,
          'noOfResidents': locationDetails.residents.length
        }
        character.location = {...character.location, ...locationObj};
      }
      character['chapterNames']=[];
      if(character.episode.length) {
        character.episode.forEach(async chapter => {
          const chapterResponse = await fetch(chapter);
          const episodeResult = await chapterResponse.json();
          character.chapterNames.push(episodeResult.name);
          setCharacterResuts(characterResults); 
          setIsLoading(false); 
        })
      }
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await fetch(`https://rickandmortyapi.com/api/character?page=${currentPage}`)
      const data = await res.json();
      if(data.info) {
        setPaginationInfo(data.info);
      }
      if(data.results.length) {
        getLocationAndOriginDetails(data.results);
      }
    };
    fetchData();
  }, [currentPage])
  return (
    <Fragment>
      { isLoading ? (<div className='centered'><h1>Loading ...</h1></div>):
        (<Fragment>
          <div className="card-container">
            {characterResults.map(item => {
              return (<div key={item.id} className="card">
                      <img className="character-image" src={item.image} alt="Characters"/>
                      <div className="character-info">
                        <div className="character-name">{item.name}</div>
                        <div>{item.status} - {item.species}</div>
                        <div className="location-info">
                          <div>Origin: {item.origin.name}</div>
                          <div>Location: {item.location.name}</div>
                          <div>Dimension: {item.location.dimension}</div>
                          <div>Amount of residents: {item.location.noOfResidents}</div>
                          <div>Chapter Names: {item?.chapterNames?.slice(0, 5).join(', ')}</div>
                        </div>
                      </div>
                    </div>)
                  })
            }
          </div>
          <div className="pagination">
            <button
              onClick={goToPreviousPage}
              className={`prev ${currentPage === 1 ? 'disabled' : ''}`}
            >
              prev
            </button>

            {new Array(paginationInfo.pages).fill().map((_, idx) => idx + 1).map((item, index) => (
              <a
                key={index}
                onClick={changePage}
                className={`paginationItem ${currentPage === item ? 'active' : ''}`}
              >
                <span>{item}</span>
              </a>
            ))}

            <button
              onClick={goToNextPage}
              className={`next ${currentPage === paginationInfo.pages ? 'disabled' : ''}`}
            >
              next
            </button>
          </div>
        </Fragment>)
      }
    </Fragment>
  );
}

export default App;
