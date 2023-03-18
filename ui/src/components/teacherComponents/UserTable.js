import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserCircle } from '@fortawesome/free-solid-svg-icons'

import "bootstrap/dist/css/bootstrap.css";
import { Button, Col, Row, Table } from "react-bootstrap";
import {
  DatatableWrapper,
  Filter,
  Pagination,
  PaginationOptions,
  TableBody,
  TableColumnType,
  TableHeader
} from "react-bs-datatable";

import TABLE_BODY from "../data.json";

type ArrayElementType = typeof TABLE_BODY[number] & {
  img: any;
};

// Create table headers consisting of 4 columns.
const STORY_HEADERS: TableColumnType<ArrayElementType>[] = [
  {
    prop: "avatar",
    cell: (row) => (
        <FontAwesomeIcon size="2x" icon={faUserCircle} color="orange"></FontAwesomeIcon>        
      )
  },
  {
    prop: "username",
    title: "Username",
    isFilterable: true
  },
  {
    prop: "button",
    cell: (row) => (
      <Button
        variant="success"
        size="sm"
        onClick={() => {
          alert(`${row.username}'s score is ${row.score}`);
        }}
      >
        Answer
      </Button>
    )
  },
  {
    prop: "date",
    title: "Last Update"
  },
  {
    prop: "score",
    title: "Nb messages",
    isSortable: true
  }
];

// Then, use it in a component.
export default function UserTable() {
  return (
    <DatatableWrapper
      body={TABLE_BODY}
      headers={STORY_HEADERS}
    //   paginationOptionsProps={{
    //     initialState: {
    //       rowsPerPage: 10,
    //       options: [5, 10, 15, 20]
    //     }
    //   }}
    >
      <Row className="mb-4 p-2">
        <Col
          xs={12}
          lg={4}
          className="d-flex flex-col justify-content-end align-items-end"
        >
          <Filter  />
        </Col>
        
      </Row>
      <Table>      
        <tr>
            <th className="tg-0lax" colSpan={"5"}><h5>PENDING HELP-SEEKING</h5>  </th>
        </tr>
      
        <TableBody />
        <tr>
            <th className="tg-0lax" colSpan={"5"}><h5>NO PENDING HELP-SEEKING</h5>  </th>
        </tr>
        <TableBody />
      </Table>
    </DatatableWrapper>
  );
}
