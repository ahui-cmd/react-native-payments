const fs = require('fs');
const JSON5 = require('json5');
const path = require('path');

const templatePath = path.join(__dirname, '..', 'harmony', 'build-profile.template.json5');
const existingProfilePath = path.join(__dirname, '..', 'harmony', 'build-profile.json5');

if (fs.existsSync(existingProfilePath)) {
  const existingProfile = JSON5.parse(fs.readFileSync(existingProfilePath, 'utf-8'));
  const template = JSON5.parse(fs.readFileSync(templatePath, 'utf-8'));
  const signingConfigs = existingProfile.app && existingProfile.app.signingConfigs;

  const merged = { ...template };

  if (signingConfigs && signingConfigs.length > 0) {
    merged.app.signingConfigs = signingConfigs;
  }

  fs.writeFileSync(existingProfilePath, JSON5.stringify(merged, null, 2));
} else {
  fs.copyFileSync(templatePath, existingProfilePath);
}
