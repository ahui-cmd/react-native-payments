# Copyright (c) 2026 Huawei Device Co., Ltd. All rights reserved
# Use of this source code is governed by a MIT license that can be
# found in the LICENSE file.

cmake_minimum_required(VERSION 3.13)
add_library(rnoh_payments SHARED RNPaymentsPackage.cpp)
target_include_directories(rnoh_payments PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(rnoh_payments PUBLIC rnoh)
