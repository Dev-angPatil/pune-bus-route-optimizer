#pragma once
#include <string>

struct Stop {
    std::string id;
    std::string name;
    double lat{0.0};
    double lon{0.0};
    std::string category;
    std::string description;
};
