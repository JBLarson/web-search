import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import FlagIcon from '@mui/icons-material/Flag';
import IconButton from '@mui/material/IconButton';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopy from '@mui/icons-material/ContentCopy';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import {
  addQuery, setLastSearchTime, removeQuery, setQueryProperty,
} from './query/querySlice';
import Search from './query/Search';
import PlatformPicker from './query/PlatformPicker';
import AlertDialog from '../ui/AlertDialog';
import CountOverTimeResults from './results/CountOverTimeResults';
import TotalAttentionResults from './results/TotalAttentionResults';
import TopWords from './results/TopWords';
import TopLanguages from './results/TopLanguages';
import SampleStories from './results/SampleStories';
import TabPanelHelper from '../ui/TabPanelHelper';
import { searchApi } from '../../app/services/searchApi';
import deactivateButton from './util/deactivateButton';
import urlSerializer from './util/urlSerializer';
import tabTitle2 from './util/tabTitles2';
import compareArrays from './util/compareArrays';
import { useListCollectionsFromNestedArrayMutation } from '../../app/services/collectionsApi';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function TabbedSearch() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const queryState = useSelector((state) => state.query);
  const updatedQueryState = JSON.parse(JSON.stringify(queryState));

  const [color, setColors] = useState(['white']);
  const [edit, setEdit] = useState([false]);
  const [textFieldsValues, setTextFieldValues] = useState(queryState.map((query) => query.name));
  const { platform } = queryState[0];

  const [getCollectionNames] = useListCollectionsFromNestedArrayMutation();
  const [collectionNames, setCollectionNames] = useState([]);

  useEffect(() => {
    setShow(deactivateButton(queryState));
    setTextFieldValues(queryState.map((query) => query.name));
    const fetchData = async () => {
      // grab all the collection ids for each query
      const collectionIds = queryState.map((query) => query.collections);
      // when queryState is loaded it grabs from state, on rerender is the information that we want
      if (!compareArrays(collectionIds, [[34412234]])) {
        const nestedArrayOfCollectionData = await getCollectionNames(collectionIds).unwrap();
        setCollectionNames(nestedArrayOfCollectionData.collection);
      }
    };
    fetchData();
  }, [queryState]);

  // Modify the handleSearch function to pass the queryState to urlSerializer
  const handleSearch = (state) => {
    navigate(`/search?${urlSerializer(state)}`, { options: { replace: true } });
  };

  const handleShare = () => {
    const ahref = `search.mediacloud.org/search?${urlSerializer(queryState)}`;
    navigator.clipboard.writeText(ahref);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleAddQuery = () => {
    const qsLength = queryState.length;
    setColors(() => [...color, 'White']);
    setEdit(() => [...edit, false]);
    dispatch(addQuery(platform));
    dispatch(setQueryProperty(
      {
        name: `Query ${queryState.length + 1}`,
        queryIndex: queryState.length,
        property: 'name',
      },
    ));

    setValue(qsLength);
  };

  const handleRemoveQuery = (index) => {
    const updatedColor = [];
    const updatedEdit = [];

    // clean this up
    for (let i = 0; i < color.length; i += 1) {
      if (i !== index) {
        updatedColor.push(color[i]);
        updatedEdit.push(edit[i]);
      }
    }
    setColors(updatedColor);
    setEdit(updatedEdit);

    dispatch(removeQuery(index));

    if (index === 0) {
      setValue(0);
    } else {
      setValue(index - 1);
    }
  };

  const [anchorEl, setAnchorEl] = useState(false);

  const handleClose = (index, colorValue) => {
    setValue(index);
    if (colorValue === 'edit') {
      const updatedEdit = [...edit];
      updatedEdit[index] = true;
      setEdit(updatedEdit);
    } else {
      const newColors = [...color];
      newColors[index] = colorValue;
      setColors(newColors);
    }
    setAnchorEl(null);
  };

  return (
    <div className="container search-container">
      <PlatformPicker queryIndex={0} sx={{ paddingTop: 50 }} />
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', marginLeft: 6 }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            {queryState.map((query, i) => (
              <Tab
                onContextMenu={
                  (event) => {
                    setValue(i);
                    event.preventDefault();
                    setAnchorEl(event.currentTarget);
                  }
                }
                sx={{ marginRight: 0.5 }}
                style={{ outline: `4px solid ${color[i]}`, outlineOffset: '-4px' }}
                label={(
                  <Box sx={{ display: 'flex' }}>
                    {/* edit === false */}
                    {!edit[i]
                      ? (
                        <div className="tabTitleLabel">
                          {/* Title */}
                          {queryState[i].name}

                          {/* Flag (Custom Title) */}
                          {queryState[i].edited && (
                            <IconButton
                              sx={{ color: '#d24527', marginLeft: '.5rem' }}
                              onClick={() => {
                                const updatedEdit = [...edit];
                                updatedEdit[i] = false;
                                setEdit(updatedEdit);
                                updatedQueryState[i].edited = false;
                                dispatch(setQueryProperty({ edited: false, queryIndex: value, property: 'edited' }));
                                handleSearch(updatedQueryState); // url matches queryState
                              }}
                              color="primary"
                            >
                              <FlagIcon sx={{ paddingLeft: '5px' }} />
                            </IconButton>
                          )}

                          {/* Dropdown Menu */}
                          <Menu anchorEl={anchorEl} open={anchorEl} onClose={handleClose}>
                            <MenuItem onClick={() => handleClose(value, 'orange')}>Orange</MenuItem>
                            <MenuItem onClick={() => handleClose(value, 'yellow')}>Yellow</MenuItem>
                            <MenuItem onClick={() => handleClose(value, 'green')}>Green</MenuItem>
                            <MenuItem onClick={() => handleClose(value, 'blue')}>Blue</MenuItem>
                            <MenuItem onClick={() => handleClose(value, 'indigo')}>Indigo</MenuItem>
                            <MenuItem onClick={() => handleClose(value, 'edit')}>Edit</MenuItem>
                          </Menu>

                        </div>
                      )
                      // edit === true
                      : (
                        <div className="tabTitleLabel">
                          {/* TextField for a custom title */}
                          <TextField
                            id="outlined-size-small"
                            size="small"
                            value={textFieldsValues[i]}
                            onChange={(event) => {
                              const updatedValues = [...textFieldsValues];
                              updatedValues[value] = event.target.value;
                              setTextFieldValues(updatedValues);
                            }}
                          />
                          {/* Confirm Edit */}
                          <IconButton
                            sx={{ color: '#d24527', marginLeft: '.5rem' }}
                            onClick={() => {
                              const updatedEdit = [...edit];
                              updatedEdit[value] = false;
                              setEdit(updatedEdit);
                            }}
                          >
                            <CancelIcon />
                          </IconButton>

                          {/* Confirm Edit */}
                          <IconButton
                            disabled={textFieldsValues[i].length === 0}
                            sx={{ color: '#d24527', marginLeft: '.5rem' }}
                            onClick={() => {
                              const updatedEdit = [...edit];
                              updatedEdit[value] = false;
                              setEdit(updatedEdit);
                              updatedQueryState[i].name = textFieldsValues[i];
                              updatedQueryState[i].edited = true;
                              dispatch(setQueryProperty({ name: textFieldsValues[i], queryIndex: value, property: 'name' }));
                              dispatch(setQueryProperty({ edited: true, queryIndex: value, property: 'edited' }));
                              handleSearch(updatedQueryState); // url matches queryState
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </div>
                      )}

                    {/* Remove Icon  */}
                    {(queryState.length !== 1) && (
                      <RemoveCircleOutlineIcon
                        sx={{ color: '#d24527', marginLeft: '.5rem' }}
                        onClick={() => handleRemoveQuery(i)}
                        variant="contained"
                      />
                    )}
                  </Box>
                )}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...a11yProps(i)}
              />
            ))}
            <Tab label="+ Add Query" onClick={handleAddQuery} />
          </Tabs>
        </Box>

        {queryState.map((query, i) => (
          <TabPanelHelper key={i} value={value} index={i}>
            <Search queryIndex={i} />
          </TabPanelHelper>
        ))}
      </Box>

      <div className="search-button-wrapper">
        <div className="container">
          <div className="row">

            <div className="col-11">
              <AlertDialog
                openDialog={open}
                outsideTitle="Share this Search"
                title="Share this Search"
                content={<code>{`search.mediacloud.org/search?${urlSerializer(queryState)}`}</code>}
                action={handleShare}
                actionTarget
                snackbar
                snackbarText="Search copied to clipboard!"
                dispatchNeeded={false}
                onClick={() => setOpen(true)}
                variant="outlined"
                startIcon={<ContentCopy titleAccess="copy this search" />}
                secondAction={false}
                className="float-end"
                confirmButtonText="copy"
              />
            </div>

            <div className="col-1">
              {/* Search */}
              <Button
                className="float-end"
                variant="contained"
                disabled={!show}
                startIcon={<SearchIcon titleAccess="search this query" />}
                onClick={() => {
                  dispatch(searchApi.util.resetApiState());
                  dispatch(setLastSearchTime(dayjs().unix()));
                  queryState.forEach((q, i) => {
                    if (!queryState[i].edited) {
                      dispatch(setQueryProperty(
                        {
                          // eslint-disable-next-line max-len
                          name: tabTitle2(q.queryList, q.negatedQueryList, q.anyAll, q.queryString, i, queryState, collectionNames),
                          queryIndex: i,
                          property: 'name',
                        },
                      ));
                    }
                  });
                  handleSearch(queryState);
                }}
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="search-results-wrapper">
        <div className="container">
          <CountOverTimeResults />
          {/* <TotalAttentionResults /> */}
          {/* <SampleStories /> */}
          {/* <TopWords /> */}
          {/* <TopLanguages /> */}
        </div>
      </div>
    </div>
  );
}
