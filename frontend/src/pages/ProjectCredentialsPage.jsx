// frontend/src/pages/ProjectCredentialsPage.jsx
import React from "react";
import {
  Box,
  Container,
  Heading,
  Link,
  List,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";

export default function ProjectCredentialsPage() {
  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="start">
        <Heading as="h1" size="xl">
          Project Credentials
        </Heading>

        <Box>
          <Text fontWeight="bold">Project Name:</Text>
          <Text>Vehicle Management System</Text>
        </Box>

        <Box>
          <Text fontWeight="bold">Developed by (Group):</Text>
          <Text>Fx3Losers</Text>
        </Box>

        <Box>
          <Text fontWeight="bold">Team Leader:</Text>
          <Text>Shah Mohammad Rizvi</Text>
        </Box>

        <Box>
          <Text fontWeight="bold">Group Members:</Text>
          <UnorderedList pl={6}>
            <ListItem>Aman Uddin Siyam</ListItem>
            <ListItem>Rakibul Islam Refat</ListItem>
            <ListItem>Sajib Ahmed Razon</ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Text fontWeight="bold">University:</Text>
          <Text>International University of Business Agriculture and Technology</Text>
        </Box>

        <Box>
          <Text fontWeight="bold">Supervisor:</Text>
          <Text>Sheekar Banerjee (Lecturer, Department of CSE)</Text>
        </Box>

        <Box>
          <Text fontWeight="bold">References:</Text>
          <List spacing={2} pl={6}>
            <ListItem>
              “MERN Stack Tutorial” – MongoDB, Express, React, Node.js official docs
            </ListItem>
            <ListItem>
              Chakra UI Documentation – https://chakra-ui.com/docs
            </ListItem>
            <ListItem>
              Stripe API Reference – https://stripe.com/docs/api
            </ListItem>
            <ListItem>
              React Router Guide – https://reactrouter.com/docs
            </ListItem>
            <ListItem>
              Zustand State Management – https://github.com/pmndrs/zustand
            </ListItem>
          </List>
        </Box>

        <Box>
          <Text fontWeight="bold">Contact Details:</Text>
          <UnorderedList pl={6}>
            <ListItem>
              Shah Mohammad Rizvi –{" "}
              <Link color="blue.500" href="mailto:smri29.ml@gmail.com">
                smri29.ml@gmail.com
              </Link>
            </ListItem>
            <ListItem>
              Aman Uddin Siyam –{" "}
              <Link color="blue.500" href="mailto:amansiyam44@gmail.com">
                amansiyam44@gmail.com
              </Link>
            </ListItem>
            <ListItem>
              Rakibul Islam Refat –{" "}
              <Link color="blue.500" href="mailto:rakibulislamrefat126@gmail.com">
                rakibulislamrefat126@gmail.com
              </Link>
            </ListItem>
            <ListItem>
              Sajib Ahmed Razon –{" "}
              <Link color="blue.500" href="mailto:22203142@iubat.edu">
                22203142@iubat.edu
              </Link>
            </ListItem>
          </UnorderedList>
        </Box>
      </VStack>
    </Container>
  );
}
