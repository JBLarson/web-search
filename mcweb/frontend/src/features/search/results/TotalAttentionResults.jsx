import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Settings } from '@mui/icons-material';
import BarChart from './BarChart';
import queryGenerator from '../util/queryGenerator';
import { useGetTotalCountMutation } from '../../../app/services/searchApi';
import {
  PROVIDER_REDDIT_PUSHSHIFT,
  PROVIDER_NEWS_WAYBACK_MACHINE,
  PROVIDER_NEWS_MEDIA_CLOUD,
} from '../util/platforms';

export const supportsNormalizedCount = (platform) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  [PROVIDER_NEWS_WAYBACK_MACHINE, PROVIDER_REDDIT_PUSHSHIFT, PROVIDER_NEWS_MEDIA_CLOUD].includes(platform);

function TotalAttentionResults() {
  const {
    queryString,
    queryList,
    negatedQueryList,
    platform,
    startDate,
    endDate,
    collections,
    sources,
    lastSearchTime,
    anyAll,
    advanced,
  } = useSelector((state) => state.query);

  const fullQuery = queryString
    || queryGenerator(queryList, negatedQueryList, platform, anyAll);

  const [normalized, setNormalized] = useState(true);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (e) => setAnchorEl(e.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);

  const [query, { isLoading, data, error }] = useGetTotalCountMutation();

  const collectionIds = collections.map((c) => c.id);
  const sourceIds = sources.map((s) => s.id);

  // using EPSILON in the denominator here prevents against div by zero errors
  // (which returns infinity in JS)
  const normalizeData = (oldData) => 100 * (oldData.count.relevant / (oldData.count.total + Number.EPSILON));

  useEffect(() => {
    if (queryList[0].length !== 0 || (advanced && queryString !== 0)) {
      query({
        query: fullQuery,
        startDate,
        endDate,
        collections: collectionIds,
        sources: sourceIds,
        platform,
      });
      setNormalized(supportsNormalizedCount(platform));
    }
  }, [lastSearchTime]);

  if (isLoading) {
    return (
      <div>
        {' '}
        <CircularProgress size="75px" />
        {' '}
      </div>
    );
  }

  if (!data && !error) return null;
  return (
    <div className="results-item-wrapper">
      <div className="row">
        <div className="col-4">
          <h2>Total Attention</h2>
          <p>
            Compare the total number of items that matched your queries. Use the
            &quot;view options&quot; menu to switch between story counts and a
            percentage (if supported).
          </p>
        </div>
        <div className="col-8">
          {error && (
            <Alert severity="warning">
              Sorry, but something went wrong. (
              {error.data.note}
              )
            </Alert>
          )}
          {error === undefined && (
            <div>
              {normalizeData(data) === 0 && (
                <Alert severity="warning">
                  No content has matched this query
                </Alert>
              )}
              {normalizeData(data) === 100 && (
                <Alert severity="warning">
                  {' '}
                  This query has returned 100% attention
                  {' '}
                </Alert>
              )}
              <BarChart
                series={[
                  {
                    data: [
                      {
                        key: fullQuery,
                        value: normalizeData(data) === 100
                          ? data.count.relevant
                          : (normalized && normalizeData(data))
                          || data.count.relevant,
                      },
                    ],
                    name: 'Matching Content',
                    color: '#2f2d2b',
                  },
                ]}
                normalized={normalized && normalizeData(data) !== 100}
                title="Total Stories Count"
                height={200}
              />
            </div>
          )}
          <div className="clearfix">
            {supportsNormalizedCount(platform) && (
              <div className="float-start">
                {normalized && normalizeData(data) !== 100 && (
                  <div>
                    <Button
                      onClick={handleClick}
                      endIcon={
                        <Settings titleAccess="view other chart viewing options" />
                      }
                    >
                      View Options
                    </Button>
                    <Menu
                      id="basic-menu"
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      MenuListProps={{
                        'aria-labelledby': 'basic-button',
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          setNormalized(false);
                          handleClose();
                        }}
                      >
                        View Story Count
                      </MenuItem>
                    </Menu>
                  </div>
                )}
                {!normalized && normalizeData(data) !== 100 && (
                  <div>
                    <Button onClick={handleClick}>View Options</Button>
                    <Menu
                      id="basic-menu"
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      MenuListProps={{
                        'aria-labelledby': 'basic-button',
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          setNormalized(true);
                          handleClose();
                        }}
                      >
                        View Normalized Story Percentage (default)
                      </MenuItem>
                    </Menu>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TotalAttentionResults;
