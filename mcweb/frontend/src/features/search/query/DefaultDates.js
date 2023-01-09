import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { setStartDate } from './querySlice';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import urlSerializer from '../util/urlSerializer';
import { searchApi } from '../../../app/services/searchApi';
import { setSearchTime } from './querySlice';


import { Link } from "@mui/material";

export default function DefaultDates({ amountOfTime, typeOfTime, message }) {

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const {
    queryString,
    queryList,
    negatedQueryList,
    startDate,
    endDate,
    collections,
    sources,
    platform,
    anyAll,
    advanced,
  } = useSelector((state) => state.query);

  const queryObject = {
    queryList,
    negatedQueryList,
    queryString,
    startDate,
    endDate,
    platform,
    collections,
    sources,
    anyAll,
    advanced,
  };

  return (


    <Link
      underline="hover"
      component="button"
      variant="body2"
      sx={{ marginRight: 3 }}

      onClick={() => {
        const day = dayjs(endDate, "MM-DD-YYYY").subtract(amountOfTime, typeOfTime).format('MM/DD/YYYY');

        dispatch(setStartDate(day));

        navigate(
          `/search${urlSerializer(queryObject)}`,
          { options: { replace: true } },
        );
        dispatch(searchApi.util.resetApiState());
        dispatch(setSearchTime(dayjs().unix()));

      }}
    >
      {message}
    </Link>


  )

}