// components/dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Box, H2, H5, Text } from '@adminjs/design-system';
import { ApiClient } from 'adminjs';

const Dashboard = () => {
  const [data, setData] = useState({
    campaigns: 0,
    clients: 0,
    users: 0,
    analytics: 0
  });
  const api = new ApiClient();

  useEffect(() => {
    api.getDashboard()
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching dashboard data:', error);
      });
  }, []);

  return (
    <Box variant="grey">
      <Box variant="white" padding="xl">
        <H2>Welcome to JalSync Dashboard</H2>
        <Text>Manage your water management system efficiently</Text>
        
        <Box mt="xl" mb="xl">
          <Box flex>
            <Box variant="white" padding="lg" mr="lg" flex="1" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
              <H5>Total Campaigns</H5>
              <Text>{data.campaigns}</Text>
            </Box>
            <Box variant="white" padding="lg" mr="lg" flex="1" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
              <H5>Total Clients</H5>
              <Text>{data.clients}</Text>
            </Box>
            <Box variant="white" padding="lg" mr="lg" flex="1" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
              <H5>Total Users</H5>
              <Text>{data.users}</Text>
            </Box>
            <Box variant="white" padding="lg" flex="1" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
              <H5>Analytics Records</H5>
              <Text>{data.analytics}</Text>
            </Box>
          </Box>
        </Box>

        <Box mt="xl">
          <H5>Quick Actions</H5>
          <Box flex mt="lg">
            <Box 
              variant="white" 
              padding="lg" 
              mr="lg" 
              flex="1" 
              onClick={() => window.location.href = '/admin/resources/Campaign/new'}
              style={{ cursor: 'pointer', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
            >
              <Text>Create New Campaign</Text>
            </Box>
            <Box 
              variant="white" 
              padding="lg" 
              mr="lg" 
              flex="1"
              onClick={() => window.location.href = '/admin/resources/Client/new'}
              style={{ cursor: 'pointer', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
            >
              <Text>Add New Client</Text>
            </Box>
            <Box 
              variant="white" 
              padding="lg" 
              flex="1"
              onClick={() => window.location.href = '/admin/resources/Analytics/new'}
              style={{ cursor: 'pointer', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
            >
              <Text>Create Analytics Report</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;