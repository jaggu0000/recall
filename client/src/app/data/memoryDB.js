const memoryDB = [
  {
    type: "person",
    data: {
      name: "Ajay",
      images: ["/faces/Ajay.jpg"], // multiple angles later
      relation: "Friend",
      priority: 1,
      memories: [
        {
          memory: "You met him at college",
          priority: 1,
        },
      ],
    },
  },
  {
    type: "person",
    data: {
      name: "Jagan",
      images: ["/faces/Jagan.jpeg"], // multiple angles later
      relation: "Friend",
      priority: 1,
      memories: [
        {
          memory: "He is the previous IEDC Student Lead.",
          priority: 1,
        },
      ],
    },
  },
  {
    type: "person",
    data: {
      name: "Harsha",
      images: ["/faces/Harsha.jpeg"], // multiple angles later
      relation: "Friend",
      priority: 1,
      memories: [
        {
          memory: "Nice Friend, Hackathon colleague.",
          priority: 1,
        },
      ],
    },
  },
  {
    type: "person",
    data: {
      name: "Trisha",
      images: ["/faces/Trisha.jpeg"], // multiple angles later
      relation: "Friend",
      priority: 1,
      memories: [
        {
          memory: "Nice Friend, Classmate.",
          priority: 1,
        },
      ],
    },
  },
];

export default memoryDB;

// [
//   {
//     type: Boolean[person | text],
//     data: {
//       name: "Anjali",
//       images: [],
//       age: Number,
//       relation: Text,
//       priority: Number,
//       memories: [
//         {
//           time_created: Date,
//           time_updated: Date,
//           memory: Text,
//           priority: Number,
//           tags: [Text],
//         },
//       ],
//       text:Text,
//     },
//   },
// ];
