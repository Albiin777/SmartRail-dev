export const trainsData = [
    {
        trainNo: "12627",
        name: "Tamil Nadu Express",
        stations: ["Chennai", "Nellore", "Vijayawada", "Nagpur", "Delhi"],
        coaches: ["S1", "S2", "S3"],
        passengers: [
            {
                id: 1,
                coach: "S3",
                name: "Rahul",
                seat: 1,
                boarding: "Chennai",
                destination: "Delhi",
                status: "CNF",
                verified: false
            },
            {
                id: 2,
                coach: "S3",
                name: "Priya",
                seat: null,
                boarding: "Chennai",
                destination: "Delhi",
                status: "RAC",
                verified: false
            }
        ]
    }
];
