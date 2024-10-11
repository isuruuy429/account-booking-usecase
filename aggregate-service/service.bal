// Copyright (c) 2024, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein is strictly forbidden, unless permitted by WSO2 in accordance with
// the WSO2 Software License available at: https://wso2.com/licenses/eula/3.2
// For specific language governing the permissions and limitations under
// this license, please see the license as well as any agreement you’ve
// entered into with WSO2 governing the purchase of this software and any
// associated services.
//
// This file is auto-generated by WSO2 Healthcare Team for managing utility functions.
// Developers are allowed modify this file as per the requirement.
import ballerina/http;
import ballerinax/health.fhir.r4;
import ballerinax/health.fhirr4;
import ballerinax/health.fhir.r4.international401;

# Generic type to wrap all implemented profiles.
public type Location international401:Location;

service / on new fhirr4:Listener(8081, practitionerApiConfig) {

    isolated resource function get fhir/r4/Practitioner(r4:FHIRContext fhirContext) returns error|r4:Bundle {
        string practitionerSearchUrl = "http://localhost:9092/fhir/r4/Practitioner";
        string queryParameters = "?";

        // Fetch the search parameter: family
        r4:StringSearchParameter[]|r4:FHIRTypeError? familyArray = fhirContext.getStringSearchParameter("family");
        if familyArray is r4:StringSearchParameter[] && familyArray.length() > 0 {
            queryParameters += string `family=${familyArray[0].value}`;
        }

        // Fetch the search parameter: given
        r4:StringSearchParameter[]|r4:FHIRTypeError? givenArray = fhirContext.getStringSearchParameter("given");
        if givenArray is r4:StringSearchParameter[] && givenArray.length() > 0 {
            if queryParameters != "?" {
                queryParameters += "&";
            }
            queryParameters += string `given=${givenArray[0].value}`;
        }

        http:Client practitionerClient = check new (practitionerSearchUrl);
        http:Response practitionerResponse = check practitionerClient->get(queryParameters);
        json jsonPayload = check practitionerResponse.getJsonPayload();
        r4:Bundle|error bundle = check jsonPayload.cloneWithType(r4:Bundle);

        if bundle is error {
            return r4:createFHIRError("Error converting JSON to FHIR Bundle", r4:CODE_SEVERITY_ERROR, r4:TRANSIENT_EXCEPTION, cause = bundle);
        }
        return bundle;
    }

}

service / on new fhirr4:Listener(8082, slotApiConfig) {
    isolated resource function get fhir/r4/Slot(r4:FHIRContext fhirContext) returns error|r4:Bundle {
        string slotSearchUrl = "http://localhost:9098/fhir/r4/Slot";
        string queryParameters = "?";

        r4:StringSearchParameter[]|r4:FHIRTypeError? practitionerArray = fhirContext.getStringSearchParameter("practitioner");

        if practitionerArray is r4:StringSearchParameter[] && practitionerArray.length() > 0 {
            if queryParameters != "?" {
                queryParameters += "&";
            }
            queryParameters += string `practitioner=${practitionerArray[0].value}`;
        }

        r4:StringSearchParameter[]|r4:FHIRTypeError? startDateArray = fhirContext.getStringSearchParameter("startDate");

        if startDateArray is r4:StringSearchParameter[] && startDateArray.length() > 0 {
            if queryParameters != "?" {
                queryParameters += "&";
            }
            queryParameters += string `start=ge${startDateArray[0].value}T06:00:00Z`;
        }

        r4:StringSearchParameter[]|r4:FHIRTypeError? endDateArray = fhirContext.getStringSearchParameter("endDate");

        if endDateArray is r4:StringSearchParameter[] && endDateArray.length() > 0 {
            if queryParameters != "?" {
                queryParameters += "&";
            }
            queryParameters += string `start=lt${endDateArray[0].value}T23:00:00Z`;
        }

        if queryParameters != "?" {
            queryParameters += "&";
        }

        queryParameters += string `service-type=https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/14249|4047611`;

        int _count = 15; 
        if queryParameters != "?" {
            queryParameters += "&";
        }
        queryParameters += string `_count=${_count}`;

        http:Client slotClient = check new (slotSearchUrl);
        http:Response slotResponse = check slotClient->get(queryParameters);
        json jsonPayload = check slotResponse.getJsonPayload();
        r4:Bundle|error bundle = check jsonPayload.cloneWithType(r4:Bundle);

        if bundle is error {
            return r4:createFHIRError("Error converting JSON to FHIR Bundle", r4:CODE_SEVERITY_ERROR, r4:TRANSIENT_EXCEPTION, cause = bundle);
        }
        return bundle;
    }
}

service / on new fhirr4:Listener(8084, locationApiConfig) {

    isolated resource function get fhir/r4/Location/[string id](r4:FHIRContext fhirContext) returns Location|error {

        http:Client locationClient = check new ("http://localhost:9095/fhir/r4");
        string locationPath = string `/Location/${id}`;

        http:Response locationResponse = check locationClient->get(locationPath);

        json jsonPayload = check locationResponse.getJsonPayload();
        Location|error location = check jsonPayload.cloneWithType(Location);

        if location is error {
            return r4:createFHIRError("Error fetching the Location FHIR resource", r4:CODE_SEVERITY_ERROR, r4:TRANSIENT_EXCEPTION, cause = location);
        }
        return location;
    }
}

service / on new fhirr4:Listener(8083, appointmentApiConfig) {

    isolated resource function post fhir/r4/Appointment(r4:FHIRContext fhirContext, international401:Appointment appointment)
    returns @http:Payload {mediaType: ["application/fhir+json"]} http:Response|r4:FHIRError|error {

        json appointmentPayload = appointment.toJson();

        http:Client appointmentClient = check new ("http://localhost:9099/fhir/r4");
        map<string> headers = {
            "Content-Type": "application/fhir+json"
        };

        http:Response|error response = appointmentClient->post("/Appointment", appointmentPayload, headers);
        if response is error {
            return r4:createFHIRError("Error invoking the pre-built service", r4:CODE_SEVERITY_ERROR, r4:TRANSIENT_EXCEPTION, cause = response);
        }
        return response;
    }
}
