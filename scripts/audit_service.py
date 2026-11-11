"""Audit every layer in the Power Under Pressure ArcGIS Feature Service."""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit, urlunsplit, parse_qsl
from urllib.request import Request, urlopen

SERVICE_URL = (
    "https://services8.arcgis.com/oTalEaSXAuyNT7xf/arcgis/rest/services/"
    "POWER_UNDER_PRESSURE_KISUMU/FeatureServer"
)


def get_json(url: str) -> dict:
    token = os.environ.get("ARCGIS_TOKEN")
    params = {"f": "pjson"}
    if token:
        params["token"] = token
    parsed = urlsplit(url)
    query = dict(parse_qsl(parsed.query))
    query.update(params)
    request_url = urlunsplit(
        (parsed.scheme, parsed.netloc, parsed.path, urlencode(query), parsed.fragment)
    )
    request = Request(request_url, headers={"User-Agent": "power-under-pressure-audit/1.0"})
    try:
        with urlopen(request, timeout=45) as response:
            data = json.load(response)
    except (HTTPError, URLError) as error:
        raise RuntimeError(f"ArcGIS request failed: {error}") from error
    if "error" in data:
        error = data["error"]
        details = "; ".join(error.get("details", []))
        raise RuntimeError(f"ArcGIS error {error.get('code')}: {error.get('message')} {details}".strip())
    return data


def audit_layer(summary: dict) -> dict:
    layer_url = f"{SERVICE_URL}/{summary['id']}"
    metadata = get_json(layer_url)
    count = get_json(f"{layer_url}/query" + "?where=1%3D1&returnCountOnly=true")
    sample = get_json(
        f"{layer_url}/query"
        + "?where=1%3D1&outFields=*&returnGeometry=true&resultRecordCount=5"
    )
    return {
        "id": summary["id"],
        "name": summary.get("name"),
        "url": layer_url,
        "geometryType": metadata.get("geometryType"),
        "displayField": metadata.get("displayField"),
        "objectIdField": metadata.get("objectIdField"),
        "globalIdField": metadata.get("globalIdField"),
        "spatialReference": metadata.get("spatialReference"),
        "extent": metadata.get("extent"),
        "capabilities": metadata.get("capabilities"),
        "maxRecordCount": metadata.get("maxRecordCount"),
        "fields": metadata.get("fields", []),
        "types": metadata.get("types", []),
        "domains": metadata.get("domains", []),
        "featureCount": count.get("count"),
        "sample": sample.get("features", []),
    }


def main() -> int:
    try:
        service = get_json(SERVICE_URL)
        layers = service.get("layers", [])
        audits = [audit_layer(layer) for layer in layers]
    except RuntimeError as error:
        print(error, file=sys.stderr)
        return 1

    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "serviceUrl": SERVICE_URL,
        "service": service,
        "layers": audits,
        "missingExpectedVoltageLayers": [
            voltage for voltage in ("66kV", "220kV")
            if not any(voltage.lower() in layer["name"].lower() for layer in audits)
        ],
    }
    Path("service_audit.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    lines = [
        "# Power Under Pressure service audit",
        "",
        f"- Generated: `{report['generatedAt']}`",
        f"- Service: `{SERVICE_URL}`",
        "",
        "| Layer ID | Actual layer name | Geometry | Features | Important fields |",
        "|---:|---|---|---:|---|",
    ]
    for layer in audits:
        fields = ", ".join(field.get("name", "") for field in layer["fields"])
        lines.append(
            f"| {layer['id']} | {layer['name']} | {layer['geometryType']} | "
            f"{layer['featureCount']} | {fields} |"
        )
    lines.extend(["", "## Missing expected voltage layers", ""])
    lines.extend(f"- {voltage}" for voltage in report["missingExpectedVoltageLayers"])
    Path("service_audit.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Audited {len(audits)} layers.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
