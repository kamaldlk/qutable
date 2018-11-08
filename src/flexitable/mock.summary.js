//batchJson which will be send to server
const batchJson = {
  Emp001: {
    "Name": "Vivek",
    "DOB": "11/12/2014",
    "Table::Skill": {
      C: {
        Skill004: {
          _Index: 2,
          Skill: 'Python'
        }
      },
      U: {
        Skill001: {
          Skill: "JS",
          Description: "Web Programming language",
          _Index: 1
        }
      },
      D: [
        "Skill002",
        "Skill003"
      ]
    }
  }
};

//changeSummary From Server
const changeSummary = {
  Emp001: {
    "Name": "Vivek",
    "DOB": "11/12/2014",
    "Age": 2,
    "Table::Skill": {
      C: {
        Skill004: {
          _Index: 2,
          Skill: 'Python'
        }
      },
      U: {
        Skill001: {
          _Index: 1,
          Skill: "JS",
          Description: "Web Programming language"
        }
      },
      D: [
        "Skill002",
        "Skill003"
      ]
    }
  }
};

const gridBatchJson = {
  C: {
    Emp001: {
      Name: "Vivek",
      DOB: "11/12/2014",
      _Index: 2
    }
  },
  U: {
    Emp002: {
      Name: "Kamal",
      _Index: 1
    }
  },
  D: [
    "Emp003"
  ]
};

export { batchJson, changeSummary, gridBatchJson };
